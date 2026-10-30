// Bytes and text the same way in Node.js and browsers: Web APIs only, no Buffer.

/** The bytes of base64 or base64url text (padding optional). */
export function base64Bytes(text: string): Uint8Array {
  const standard = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(standard + "=".repeat((4 - (standard.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** A JWT's payload claims, unverified. */
export function jwtPayload(token: string): unknown {
  const [, payload] = token.split(".");
  if (!payload) throw new Error("token is not a JWT");
  return JSON.parse(new TextDecoder().decode(base64Bytes(payload)));
}

/** UTF-8 bytes of text; an unpaired surrogate counts as U+FFFD, as in Node.js. */
export function utf8Bytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function utf8Length(text: string): number {
  return utf8Bytes(text).length;
}
