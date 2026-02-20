/**
 * Generates a random short code for URL shortening.
 * Uses base62 (0-9, a-z, A-Z) for URL-safe, compact codes.
 * Length 6 → 62^6 ≈ 56 billion combinations (collision-resistant).
 * Pure function: no I/O; uniqueness enforced by repository layer.
 */
const BASE62_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_LENGTH = 6;

export function generateShortCode(length: number = DEFAULT_LENGTH): string {
  const randomValues = new Uint8Array(length);
  getRandomValues(randomValues);

  let code = "";
  for (let i = 0; i < length; i++) {
    code += BASE62_ALPHABET[randomValues[i]! % BASE62_ALPHABET.length];
  }
  return code;
}

function getRandomValues(buffer: Uint8Array): void {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }
}
