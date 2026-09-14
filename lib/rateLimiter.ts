import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface BruteForceRecord {
  failures: number;
  lockedUntil: number;
}

// In-memory cache for sliding window rate limiting
const ipRateLimits = new Map<string, RateLimitRecord>();
const loginBruteForce = new Map<string, BruteForceRecord>();

// Cleanup stale records periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  ipRateLimits.forEach((record, key) => {
    if (now > record.resetAt) {
      ipRateLimits.delete(key);
    }
  });
  loginBruteForce.forEach((record, key) => {
    if (now > record.lockedUntil && record.failures === 0) {
      loginBruteForce.delete(key);
    }
  });
}, 5 * 60 * 1000);

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    return parts[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Standard Rate Limiter for Public Endpoints (e.g., 60 req/minute per IP)
 * Allows VIP Bypass if req has valid bot API Key or webhook secret
 */
export function checkRateLimit(
  req: NextRequest,
  options: { maxRequests?: number; windowMs?: number; keyPrefix?: string } = {}
): { allowed: boolean; remaining: number; resetInMs: number } {
  const maxRequests = options.maxRequests || 60;
  const windowMs = options.windowMs || 60 * 1000;
  const prefix = options.keyPrefix || 'public';

  const ip = getClientIp(req);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const record = ipRateLimits.get(key);

  if (!record || now > record.resetAt) {
    ipRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - record.count),
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

/**
 * Anti Brute-Force for Admin Login (Max 5 failed attempts per IP -> 15 min lock)
 */
export function checkLoginBruteForce(req: NextRequest): {
  isLocked: boolean;
  remainingAttempts: number;
  lockRemainingMs: number;
} {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginBruteForce.get(ip);

  if (!record) {
    return { isLocked: false, remainingAttempts: 5, lockRemainingMs: 0 };
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockRemainingMs: record.lockedUntil - now,
    };
  }

  if (record.lockedUntil && now >= record.lockedUntil) {
    // Lock period expired, reset attempts
    loginBruteForce.delete(ip);
    return { isLocked: false, remainingAttempts: 5, lockRemainingMs: 0 };
  }

  const remaining = Math.max(0, 5 - record.failures);
  return { isLocked: false, remainingAttempts: remaining, lockRemainingMs: 0 };
}

export function recordLoginFailure(req: NextRequest): { isLocked: boolean; lockMinutes: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginBruteForce.get(ip) || { failures: 0, lockedUntil: 0 };

  record.failures += 1;

  if (record.failures >= 5) {
    const lockDuration = 15 * 60 * 1000; // 15 minutes lockout
    record.lockedUntil = now + lockDuration;
    loginBruteForce.set(ip, record);
    return { isLocked: true, lockMinutes: 15 };
  }

  loginBruteForce.set(ip, record);
  return { isLocked: false, lockMinutes: 0 };
}

export function resetLoginFailures(req: NextRequest): void {
  const ip = getClientIp(req);
  loginBruteForce.delete(ip);
}
