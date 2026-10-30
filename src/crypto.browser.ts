// `node:crypto` in the browser build. Hashing and signing serve AccessKey work
// (request signatures, delegation, GenAuth management, agent activation), which
// never runs in a page; a page holds only a person's token. Random ids are Web.
import { QoniUnsupportedError } from "./errors";

function serverOnly(): never {
  throw new QoniUnsupportedError(
    "This call needs the AccessKey and runs only on a server (Node.js). " +
      "In a page, create new Qoni({ webAgentHost }) and pass a person's token from webAgentGrant.",
  );
}

export const createHash = serverOnly;
export const createHmac = serverOnly;

export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}
