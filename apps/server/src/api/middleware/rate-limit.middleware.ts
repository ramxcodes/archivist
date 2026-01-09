import { env } from "@archivist/env/server";
import type { Request, Response, NextFunction } from "express";
import { redis } from "@/lib/redis";

const RATE_LIMIT_CONFIG = {
  windowSizeSeconds: 60,
  keyPrefix: "rate_limit",
} as const;

interface RateLimitErrorResponse {
  error: string;
  message: string;
  retryAfter: number;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    const firstIp = forwarded.split(",")[0];
    if (firstIp) return firstIp.trim();
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  resetTime: number
): void {
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
  res.setHeader("X-RateLimit-Reset", resetTime);
}

/** IP-based rate limiting middleware using Redis sliding window. */
export async function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const clientIp = getClientIp(req);
  const key = `${RATE_LIMIT_CONFIG.keyPrefix}:${clientIp}`;
  const limit = env.RATE_LIMIT;

  try {
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, RATE_LIMIT_CONFIG.windowSizeSeconds);
    }

    const ttl = await redis.ttl(key);
    const retryAfter = ttl > 0 ? ttl : RATE_LIMIT_CONFIG.windowSizeSeconds;
    const resetTime = Math.floor(Date.now() / 1000) + retryAfter;

    setRateLimitHeaders(res, limit, limit - currentCount, resetTime);

    if (currentCount > limit) {
      res.setHeader("Retry-After", retryAfter);

      const errorResponse: RateLimitErrorResponse = {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Maximum ${limit} requests per minute allowed.`,
        retryAfter,
      };

      res.status(429).json(errorResponse);
      return;
    }

    next();
  } catch (error) {
    // Graceful degradation: allow request if Redis fails
    console.error(
      "[RateLimit] Redis error:",
      error instanceof Error ? error.message : error
    );
    next();
  }
}
