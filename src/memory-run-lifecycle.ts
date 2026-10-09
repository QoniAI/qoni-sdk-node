/** Internal per-call observation only. Not exported from the package or sent on the wire. */
export const memoryRunLifecycle: unique symbol = Symbol("qoni.memoryRunLifecycle");
export interface MemoryRunLifecycle {
  onDispatch(): void;
  /** Actual HTTP status, distinct from a business envelope status. */
  onRejected(httpStatus: number): void;
}
