interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS = {
  public: { windowMs: 60 * 1000, maxRequests: 60 },
  authenticated: { windowMs: 60 * 1000, maxRequests: 600 },
  write: { windowMs: 60 * 1000, maxRequests: 30 },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

export function checkRateLimit(
  identifier: string,
  tier: RateLimitTier
): { allowed: boolean; remaining: number; resetAt: number } {
  const config: RateLimitConfig = RATE_LIMITS[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getRateLimitHeaders(
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetAt / 1000).toString(),
  };
}
