import { randomUUID } from "node:crypto";
import { QoniError, QoniValidationError } from "./errors";
import { requestGenAuthManagement, type GenAuthAdminTokenProvider } from "./genauth-management";
import { isJsonObject, type JsonObject, type QoniTransport } from "./types";

export interface ActivateAgentInput {
  /** The personal agent, from `genauth.agents.create()`. */
  agentId: string;
  /** The person it works for (their GenAuth user id). */
  userId: string;
  /** The App the agent acts through: its app identifier (the OIDC audience). */
  audience: string;
  /** The data policies it may use on the person's behalf. */
  dataPolicyIds: string[];
  /** Recorded on the approval. */
  reason?: string;
  signal?: AbortSignal;
}

export interface AgentActivation {
  agentId: string;
  /** Its capabilities are approved and synced: the consent page can grant them. */
  ready: true;
  /** The agent's authorization as GenAuth reports it (escape hatch). */
  raw: JsonObject;
}

// How long activation waits for GenAuth to sync the agent's permissions.
const SYNC_ATTEMPTS = 15;
const SYNC_INTERVAL_MS = 2_000;

/**
 * Make a new personal agent able to act: authorize the data policies to the person,
 * draft, submit and approve the agent's capability grant, give it its local
 * credentials and sync its permissions, then wait until GenAuth reports it synced.
 * Each write carries an idempotency key from the agent and step, so running it
 * again (after a failure, or on an agent already active) is safe; an agent already
 * synced returns at once. Never touches the console-only credential route.
 */
export async function activateAgent(
  transport: QoniTransport,
  adminTokenFor: GenAuthAdminTokenProvider | undefined,
  input: ActivateAgentInput,
): Promise<AgentActivation> {
  const agentId = nonempty(input.agentId, "agentId");
  const userId = nonempty(input.userId, "userId");
  const audience = nonempty(input.audience, "audience");
  if (!Array.isArray(input.dataPolicyIds) || input.dataPolicyIds.length === 0 ||
      input.dataPolicyIds.some((id) => typeof id !== "string" || !id)) {
    throw new QoniValidationError("genauth.agents.activate needs at least one data policy id");
  }
  if (!adminTokenFor) throw new QoniValidationError("genauth.agents.activate needs the Qoni AK/SK management token");
  const signal = input.signal;
  const base = `/api/v3/agent-identity/agents/${encodeURIComponent(agentId)}`;
  const key = (step: string) => ({ "Idempotency-Key": `qoni-activate-${step}-${agentId}` });

  async function admin<T>(method: "GET" | "POST" | "PUT", path: string, body?: JsonObject, headers: Record<string, string> = {}): Promise<T> {
    signal?.throwIfAborted();
    const { accessToken, userPoolId } = await adminTokenFor!();
    const { data } = await transport.genauthJson<unknown>(method, path, accessToken, {
      headers: { "x-authing-userpool-id": userPoolId, ...headers },
      ...(body === undefined ? {} : { body }),
      signal,
    });
    return (isJsonObject(data) && "data" in data ? data.data : data) as T;
  }
  const authorization = () => admin<JsonObject | null>("GET", `${base}/authorization`);
  const synced = (a: JsonObject | null) => {
    const grant = isJsonObject(a?.active_grant) ? a.active_grant : null;
    return grant?.status === "active" && grant.permission_sync_status === "synced";
  };

  await requestGenAuthManagement(transport, adminTokenFor, "authorizeDataPolicies", {
    policyIds: input.dataPolicyIds, targetList: [{ id: userId, type: "USER" }],
  }, { signal });
  const current = await authorization();
  if (synced(current)) return { agentId, ready: true, raw: current ?? {} };

  const draft = await admin<JsonObject>("PUT", `${base}/capability-grant/draft`, {
    audience, data_policy_ids: input.dataPolicyIds, version: 0,
  });
  await admin("POST", `${base}/capability-grant/submit`, { version: Number(draft?.version ?? 0) }, key("submit"));
  const approvals = await admin<unknown>("GET", "/api/v3/agent-identity/approvals");
  const pending = (Array.isArray(approvals) ? approvals : []).filter(isJsonObject)
    .find((a) => a.agent_id === agentId && a.status === "pending");
  if (pending) {
    await admin("POST", `/api/v3/agent-identity/approvals/${encodeURIComponent(String(pending.id))}/approve`,
      { version: Number(pending.version ?? 0), reason: input.reason ?? "Personal agent created by its person" },
      key("approve"));
  }
  try {
    // The agent's local credentials; a second call for an agent that has them is refused, harmlessly.
    await admin("POST", `${base}/credentials`, undefined, { ...key("credentials"), "X-Human-Session-Id": `qoni-activate-${randomUUID()}` });
  } catch (error) {
    if (!(error instanceof QoniError) || error.status === undefined || error.status >= 500) throw error;
  }
  await admin("POST", `${base}/data-permissions/sync`, {}, key("sync"));
  for (let attempt = 0; attempt < SYNC_ATTEMPTS; attempt++) {
    const now = await authorization();
    if (synced(now)) return { agentId, ready: true, raw: now ?? {} };
    const grant = isJsonObject(now?.active_grant) ? now.active_grant : null;
    if (grant?.permission_sync_status === "failed") break;
    await sleep(SYNC_INTERVAL_MS, signal);
  }
  throw new QoniError(`Agent ${agentId}'s capabilities did not sync; the consent page will say it cannot grant them yet`, {
    code: "agent.activation_unsynced", retryable: true,
  });
}

function nonempty(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new QoniValidationError(`genauth.agents.activate: ${label} is required`);
  return value;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(() => { signal?.removeEventListener("abort", stop); resolve(); }, ms);
    const stop = () => { clearTimeout(timer); reject(signal?.reason); };
    signal?.addEventListener("abort", stop, { once: true });
  });
}
