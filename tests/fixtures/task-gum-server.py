"""SDK 自有 TCP fixture：只读原 GUM 路由/服务，合成 OBO，临时 SQLite。

不验 JWT、不接 GA/LLM/worker/计费消费者；只支持本机 loopback TCP。
"""
import hashlib
import json
import os
from pathlib import Path
import socket
import signal
import subprocess
import sys
import tempfile
import threading

sys.dont_write_bytecode = True
root = Path(os.environ["SDK_TASK_GUM_ROOT"]).resolve()
sys.path.insert(0, str(root))
import dotenv
import dotenv.main
dotenv.load_dotenv = lambda *a, **kw: False
dotenv.main.load_dotenv = lambda *a, **kw: False
os.environ.update(LOAD_ENV_LOCAL="0", OTEL_SDK_DISABLED="true", LANGFUSE_ENABLED="false")

original_connect = socket.socket.connect
original_connect_ex = socket.socket.connect_ex
def local_only(method):
    def connect(sock, address):
        if not isinstance(address, tuple) or address[0] not in {"127.0.0.1", "::1"}:
            raise RuntimeError("fixture 禁止外部网络")
        return method(sock, address)
    return connect
socket.socket.connect = local_only(original_connect)
socket.socket.connect_ex = local_only(original_connect_ex)

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from sqlalchemy import create_engine, select, update
from src.api import deps
from src.api.auth import get_api_key_context
from src.api.deps_billing import (
    BillingUsageWriteDependencies, get_billing_runtime_settings,
    get_optional_billing_preflight_guard, get_optional_billing_usage_write_dependencies,
)
from src.api.routes.threads import router
from src.api.schemas.auth import ApiKeyContext
from src.common.request_context import register_request_context_middleware
from src.infra.billing.config import BillingMeteringConfig, BillingRuntimeSettings
from src.infra.billing.context import BillingIdentity, bind_billing_identity, reset_billing_identity
from src.infra.billing.estimator import BillingEstimator
from src.infra.billing.outbox import BillingUsageOutboxRepository
from src.infra.persistence.sql.message_repo import ThreadMetadataRepository
from src.infra.persistence.sql.thread_repo import ThreadRepository
from src.memory_workers.task_store import MemoryWorkerTaskStore
from src.services.messages.thread_message_service import ThreadMessageService

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def sources():
    result = {}
    for module in tuple(sys.modules.values()):
        filename = getattr(module, "__file__", None)
        if filename:
            p = Path(filename).resolve()
            if p.is_relative_to(root) and p.suffix == ".py":
                result[str(p.relative_to(root))] = sha(p)
    return result

def main():
    before = sources()
    status_before = subprocess.check_output(["git", "-C", str(root), "status", "--porcelain=v1", "-uall"], text=True)
    head_before = subprocess.check_output(["git", "-C", str(root), "rev-parse", "HEAD"], text=True).strip()
    tmp = tempfile.TemporaryDirectory(prefix="qoni-sdk-task-gum-")
    engine = create_engine("sqlite:///" + str(Path(tmp.name) / "synthetic.sqlite"))
    stats = []
    try:
        store = MemoryWorkerTaskStore(engine=engine)
        store.create_tables()
        threads = ThreadRepository(engine)
        threads._table.metadata.create_all(engine)
        metadata = ThreadMetadataRepository(engine)
        metadata._table.metadata.create_all(engine)
        service = ThreadMessageService(memory_worker_task_store=store)
        outbox = BillingUsageOutboxRepository(engine)
        outbox.create_schema()
        config = BillingMeteringConfig.from_mapping({
            "usage_event": {"event_name": "synthetic_usage", "properties": {"input_tokens": "input_tokens"}},
        })
        estimator = BillingEstimator(credit_rules=config.estimation_rules.credits, token_counter=lambda text, model=None: max(1, len(text) // 4))
        usage = BillingUsageWriteDependencies(config=config, estimator=estimator, outbox=outbox, source="sdk-task-fixture")
        app = FastAPI()
        app.include_router(router, prefix="/api")
        register_request_context_middleware(app)

        @app.middleware("http")
        async def synthetic_context(request, call_next):
            token = bind_billing_identity(BillingIdentity(external_customer_id="synthetic-owner", admin_user_id="synthetic-owner", project_id="synthetic-sdk-project", user_id="synthetic-sdk-user"))
            try:
                response = await call_next(request)
                if request.scope["path"].endswith("/messages") and response.status_code == 200:
                    # done 仅是夹具，不是实际抽取 worker 的证据。
                    raw = store.schema.worker_schema.raw_inputs
                    trigger = store.schema.trigger_table_for_source("raw_input")
                    with engine.begin() as conn:
                        conn.execute(update(raw).values(working_status="done", episodic_status="done", sentiment_status="done"))
                        raws = [dict(r) for r in conn.execute(select(raw)).mappings()]
                        triggers = [dict(r) for r in conn.execute(select(trigger)).mappings()]
                        usage_rows = [dict(r) for r in conn.execute(select(outbox._table)).mappings()]
                        stats.append({"raw": len(raws), "usage_outbox": len(usage_rows), "triggers": len(triggers),
                            "statuses": [{k: row[k] for k in ("working_status", "episodic_status", "sentiment_status")} for row in raws],
                            "trigger_digest": hashlib.sha256(json.dumps(triggers, default=str, sort_keys=True).encode()).hexdigest()})
                return response
            finally:
                reset_billing_identity(token)

        def synthetic_auth(request: Request):
            if request.headers.get("authorization") != "Bearer sdk-task-gum-synthetic":
                raise HTTPException(401, "synthetic permission denied")
            return ApiKeyContext(api_key="synthetic-context", user_id="synthetic-sdk-user", project_id="synthetic-sdk-project", cred_kind="obo_token", scopes=["gumem.memory:write"])
        app.dependency_overrides[get_api_key_context] = synthetic_auth
        app.dependency_overrides[deps.get_thread_repository] = lambda: threads
        app.dependency_overrides[deps.get_thread_metadata_repository] = lambda: metadata
        app.dependency_overrides[deps.get_thread_message_service] = lambda: service
        app.dependency_overrides[deps.get_media_resource_repository] = lambda: object()
        app.dependency_overrides[get_billing_runtime_settings] = lambda: BillingRuntimeSettings(preflight_enabled=False, usage_reporting_enabled=True)
        app.dependency_overrides[get_optional_billing_preflight_guard] = lambda: None
        app.dependency_overrides[get_optional_billing_usage_write_dependencies] = lambda: usage
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(("127.0.0.1", 0))
        sock.listen(128)
        # SDK 自有测试控制管道，直接只读查询隔离 SQLite，不增加 GUM 产品路由。
        def snapshots():
            for line in sys.stdin:
                command = json.loads(line)
                if command["command"] != "snapshot":
                    raise RuntimeError("未知 fixture 控制命令")
                with engine.connect() as conn:
                    sessions = [dict(row) for row in conn.execute(select(threads._table)).mappings()]
                    raw = [dict(row) for row in conn.execute(select(store.schema.worker_schema.raw_inputs)).mappings()]
                    usage_rows = list(conn.execute(select(outbox._table)).mappings())
                print(json.dumps({"fixture_snapshot": command["id"], "sessions": sessions,
                    "raw_count": len(raw), "usage_outbox_count": len(usage_rows)}, default=str, ensure_ascii=False), flush=True)
        threading.Thread(target=snapshots, daemon=True).start()
        print(json.dumps({"ready": True, "port": sock.getsockname()[1]}), flush=True)
        server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", log_level="error", access_log=False, lifespan="off"))
        # Uvicorn 完成 shutdown 后会重新发出捕获的 SIGTERM；此 handler 让 finally 仍可核对/清理。
        signal.signal(signal.SIGTERM, lambda *_: setattr(server, "should_exit", True))
        server.run(sockets=[sock])
    finally:
        engine.dispose()
        database_path = Path(tmp.name)
        tmp.cleanup()
        status_after = subprocess.check_output(["git", "-C", str(root), "status", "--porcelain=v1", "-uall"], text=True)
        changed = [path for path, value in before.items() if sha(root / path) != value]
        result = {"fixture_result": True, "transport": "real TCP + original GUM FastAPI route/service/SQLite/outbox",
            "head": head_before, "requests": stats, "loaded_source_hashes": before, "source_mismatches": changed,
            "gum_status_before": status_before, "gum_status_after": status_after,
            "temporary_database_removed": not database_path.exists(),
            "jwt_or_ga": False, "workers_or_llm": False, "external_billing_or_real_charge": False,
            "pg_concurrency": False, "pi_e2b_or_offline_acceptance": False}
        print(json.dumps(result, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
