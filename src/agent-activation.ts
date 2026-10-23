import { createHash, randomUUID } from "node:crypto";
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
  /** Its capabilities are approved and synced from its data policies as they are now: the consent
   * page can grant them. */
  ready: true;
  /** The agent's authorization as GenAuth reports it (escape hatch). */
  raw: JsonObject;
}

// How long activation waits for GenAuth to sync the agent's permissions.
const SYNC_ATTEMPTS = 15;
const SYNC_INTERVAL_MS = 2_000;

/**
 * Make a personal agent able to act: authorize the data policies to the person,
 * draft, submit and approve the agent's capability grant, give it its local
 * credentials and sync its permissions, then wait until GenAuth reports it synced.
 *
 * A grant is a snapshot of the policies it was made from. When the workspace later
 * changes one (a scope added), the agent keeps acting on the old snapshot and its
 * person cannot consent to the new scope; so an agent is ready only while its grant
 * was made from these policies as they are now, and is granted again otherwise.
 * Each write carries an idempotency key from the agent, the step and the policies'
 * state, so running it again (after a failure, or on an agent already current) is
 * safe and a later change is never mistaken for an earlier grant. Never touches the
 * console-only credential route.
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
  const wanted = [...new Set(input.dataPolicyIds)].sort();

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

  await requestGenAuthManagement(transport, adminTokenFor, "authorizeDataPolicies", {
    policyIds: input.dataPolicyIds, targetList: [{ id: userId, type: "USER" }],
  }, { signal });
  // When each policy was last changed; the grant's snapshot must be at least that new.
  const changed = new Map<string, string>();
  for (const policyId of wanted) {
    const { data } = await requestGenAuthManagement<unknown>(transport, adminTokenFor, "getDataPolicy", { policyId }, { signal });
    const policy = isJsonObject(data) && isJsonObject(data.data) ? data.data : data;
    if (isJsonObject(policy) && typeof policy.updatedAt === "string") changed.set(policyId, policy.updatedAt);
  }
  const stamp = createHash("sha256").update(JSON.stringify(wanted.map((id) => [id, changed.get(id) ?? ""]))).digest("hex").slice(0, 12);
  const key = (step: string) => ({ "Idempotency-Key": `qoni-activate-${step}-${agentId}-${stamp}` });
  // Active, synced, and made from these policies as they are now.
  const ready = (a: JsonObject | null) => {
    const grant = isJsonObject(a?.active_grant) ? a.active_grant : null;
    if (!(grant?.status === "active" && grant.permission_sync_status === "synced")) return false;
    const ids = Array.isArray(grant.data_policy_ids) ? [...new Set(grant.data_policy_ids.map(String))].sort() : [];
    if (ids.join() !== wanted.join()) return false;
    const policies = isJsonObject(grant.permission_snapshot) && Array.isArray(grant.permission_snapshot.policies)
      ? grant.permission_snapshot.policies.filter(isJsonObject) : [];
    const taken = new Map(policies.map((p) => [String(p.policy_id ?? ""), genauthSecond(p.updated_at)]));
    return wanted.every((id) => {
      const now = genauthSecond(changed.get(id));
      const then = taken.get(id);
      return now === undefined || then === undefined || then >= now;
    });
  };
  const current = await authorization();
  if (ready(current)) return { agentId, ready: true, raw: current ?? {} };

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
    if (ready(now)) return { agentId, ready: true, raw: now ?? {} };
    const grant = isJsonObject(now?.active_grant) ? now.active_grant : null;
    if (grant?.permission_sync_status === "failed") break;
    await sleep(SYNC_INTERVAL_MS, signal);
  }
  throw new QoniError(`Agent ${agentId}'s capabilities did not sync; the consent page will say it cannot grant them yet`, {
    code: "agent.activation_unsynced", retryable: true,
  });
}

/**
 * A GenAuth time, to the second. Its management API writes times without a zone, in Beijing
 * time: a policy created "2026-10-19 10:02:02" is the grant snapshot's "2026-10-19T02:02:02Z".
 * A time with a zone is taken as written.
 */
function genauthSecond(value: unknown): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const text = value.trim();
  const ms = Date.parse(/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text.replace(" ", "T")}+08:00`);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
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
