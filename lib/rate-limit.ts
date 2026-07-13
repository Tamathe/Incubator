import { LRUCache } from "lru-cache";

interface Entry {
  count: number;
  resetAt: number;
}

const cache = new LRUCache<string, Entry>({ max: 5000 });

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

/**
 * Returns true if the request is allowed, false if rate limited.
 * Keys should include both route and IP, e.g. `"subscribe:1.2.3.4"`.
 */
export function checkRateLimit(key: string, cfg: RateLimitConfig): boolean {
  const now = Date.now();
  const existing = cache.get(key);
  if (!existing || existing.resetAt < now) {
    cache.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return true;
  }
  if (existing.count >= cfg.max) return false;
  existing.count += 1;
  cache.set(key, existing);
  return true;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
