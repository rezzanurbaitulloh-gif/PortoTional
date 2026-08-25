const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs = 3_600_000,
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    const oldest = arr[0];
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000),
    };
  }
  arr.push(now);
  buckets.set(key, arr);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, remaining: limit - arr.length, retryAfterSec: 0 };
}
