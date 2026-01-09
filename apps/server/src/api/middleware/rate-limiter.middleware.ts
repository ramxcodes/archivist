import { env } from "@archivist/env/server";
import type { Request, Response, NextFunction } from "express";
import { redis } from "../../lib/redis";

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const key = `rate-limit:${ip}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60);
    }

    if (count > env.RATE_LIMIT) {
      const ttl = await redis.ttl(key);
      res.set("Retry-After", ttl.toString());
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next();
  }
};
