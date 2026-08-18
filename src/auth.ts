import { buildAuthorization, buildStringToSign } from "./signature";
import type { JsonObject } from "./types";

export interface QoniCredentials {
  accessKey: string;
  secretKey: string;
}

export function buildSignedHeaders(
  credentials: QoniCredentials,
  method: string,
  pathname: string,
  payload: JsonObject,
): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-authing-date": String(Date.now()),
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
