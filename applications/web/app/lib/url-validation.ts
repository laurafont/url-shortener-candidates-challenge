/**
 * Client-side URL validation. Mirrors backend rules in create-short-link.ts.
 * Server remains source of truth; this provides immediate feedback.
 */
const MAX_URL_LENGTH = 2048;
const ALLOWED_SCHEMES = ["http:", "https:"];

export function validateUrl(
  url: string,
): { ok: true } | { ok: false; error: string } {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, error: "URL is required" };
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: "URL is too long" };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "Invalid URL" };
  }
  if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
    return { ok: false, error: "URL must use http or https" };
  }
  return { ok: true };
}
