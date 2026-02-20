import type { ShortLinkRepository } from "@url-shortener/engine";
import { generateShortCode } from "@url-shortener/engine";

const MAX_URL_LENGTH = 2048;
const ALLOWED_SCHEMES = ["http:", "https:"];

function isValidUrl(url: string): { ok: true } | { ok: false; error: string } {
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

export type CreateShortLinkResult =
  | { ok: true; shortenedUrl: string }
  | { ok: false; error: string };

const MAX_CREATE_ATTEMPTS = 5;

export async function createShortLink(
  repository: ShortLinkRepository,
  originalUrl: string,
  baseUrl: string,
): Promise<CreateShortLinkResult> {
  const validation = isValidUrl(originalUrl);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const url = originalUrl.trim();
  const prefix = baseUrl && baseUrl !== "-" ? baseUrl : "";

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const code = generateShortCode();
    try {
      await repository.create({ code, originalUrl: url });
      return { ok: true, shortenedUrl: prefix ? `${prefix}${code}` : `/${code}` };
    } catch (err: unknown) {
      const isUniqueViolation =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2002";
      if (!isUniqueViolation) throw err;
    }
  }

  return { ok: false, error: "Could not generate a unique code. Please try again." };
}
