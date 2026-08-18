import { buildAuthorization, buildStringToSign } from "./signature";
import type { JsonObject } from "./types";

export interface EAKCredentials {
  accessKey: string;
  secretKey: string;
}

let lastSigningTimestamp = 0;

function nextSigningTimestamp(): number {
  const now = Date.now();
  lastSigningTimestamp = Math.max(now, lastSigningTimestamp + 1);
  return lastSigningTimestamp;
}

export function buildSignedHeaders(
  credentials: EAKCredentials,
  method: string,
  pathname: string,
  payload: JsonObject,
): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    // GenAuth rejects an already-consumed signature. A strictly monotonic
    // timestamp keeps otherwise identical requests unique within a process,
    // including retries or concurrent calls that start in the same millisecond.
    "x-authing-date": String(nextSigningTimestamp()),
    "x-authing-signature-method": "HMAC-SHA1",
    "x-authing-signature-version": "1.0",
  };
  const stringToSign = buildStringToSign(method, pathname, headers, payload);
  headers.authorization = buildAuthorization(
    credentials.accessKey,
    credentials.secretKey,
    stringToSign,
  );
  return headers;
}
