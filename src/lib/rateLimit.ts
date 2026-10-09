interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __laundryNowRateLimitBuckets: Map<string, Bucket> | undefined;
}

// Same globalThis pattern as mocks/*.ts - otherwise each route bundle would
// get its own Map and the limit would never actually trigger. In-memory, so
// this only works for a single server instance; swap for a Redis-backed
// implementation behind this same function signature before scaling out.
const buckets: Map<string, Bucket> = (globalThis.__laundryNowRateLimitBuckets ??= new Map());

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}
