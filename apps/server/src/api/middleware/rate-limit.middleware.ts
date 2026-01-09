import { env } from "@archivist/env/server";
import { getRedisClient } from "../../lib/redis";
import type { Request, Response, NextFunction } from "express";

// Get client IP address from request
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const firstIp = forwarded.split(",")[0];
    return firstIp ? firstIp.trim() : forwarded.trim();
  }
  if (typeof forwarded === "object" && forwarded?.[0]) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || req.ip || "unknown";
}

// Rate limiting middleware using Redis
export const rateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const redis = getRedisClient();
    const ip = getClientIp(req);
    const rateLimit = env.RATE_LIMIT || 50;
    const windowMs = 60 * 1000; // 1 minute in milliseconds
    const windowSeconds = Math.ceil(windowMs / 1000);
    const key = `rate_limit:${ip}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > rateLimit) {
      const ttl = await redis.ttl(key);
      const retryAfter = ttl > 0 ? ttl : windowSeconds;

      res.setHeader("Retry-After", retryAfter.toString());

      return res.status(429).json({
        message: "Too many requests",
        error: "Rate limit exceeded",
        retryAfter,
      });
    }

    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, rateLimit - count);
    const resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);

    res.setHeader("X-RateLimit-Limit", rateLimit.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());

    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    next();
  }
};
