import type {
  CompleteDelegateAgentInput,
  CompleteDelegateTokenInput,
  DelegateAgentInput,
  DelegateAgentResponse,
  DelegateTokenInteractiveInput,
  DelegateTokenInput,
  DelegateTokenResponse,
  DelegateTokenSilentResponse,
  DelegateTokenSilentInput,
  QoniResponse,
  QoniTransport,
  InteractiveDelegationResponse,
} from "./types";

type DelegateToken = {
  (input: DelegateTokenInteractiveInput): Promise<QoniResponse<InteractiveDelegationResponse>>;
  (input: DelegateTokenSilentInput): Promise<QoniResponse<DelegateTokenSilentResponse>>;
  (input: DelegateTokenInput): Promise<QoniResponse<DelegateAgentResponse>>;
};
type CompleteDelegateToken = (
  input: CompleteDelegateTokenInput,
) => Promise<QoniResponse<DelegateTokenResponse>>;

export function createQoniNamespace(
  _transport: QoniTransport,
  delegateToken: DelegateToken,
  completeDelegateToken: CompleteDelegateToken,
) {
  return {
    delegateToken,
    /** @deprecated Use delegateToken. */
    delegateAgent: (input: DelegateAgentInput) => delegateToken(input),
    completeDelegateToken,
    /** @deprecated Use completeDelegateToken. */
    completeDelegateAgent: (input: CompleteDelegateAgentInput) =>
      completeDelegateToken(input),
  };
}
