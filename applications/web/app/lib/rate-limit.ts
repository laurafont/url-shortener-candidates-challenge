/**
 * Simple in-memory rate limiter. Per-key, sliding window.
 * For production, use Redis or similar; this is fine for the 2h scope.
 */
const windowMs = 60_000; // 1 minute
const maxRequests = 10;

const store = new Map<
  string,
  { count: number; resetAt: number }
>();

function getKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function checkRateLimit(request: Request): boolean {
  const key = getKey(request);
  const now = Date.now();

  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
