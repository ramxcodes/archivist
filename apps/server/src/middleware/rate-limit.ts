import type { Request, Response, NextFunction } from 'express';
import redis from '../db/redis';

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT || '50', 10);
const WINDOW_DURATION_SECONDS = 60;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown_ip';
    const key = `ratelimit:${ip}`;

   
    const currentCount = await redis.incr(key);

    
    if (currentCount === 1) {
      await redis.expire(key, WINDOW_DURATION_SECONDS);
    }

    
    if (currentCount > RATE_LIMIT) {
      const ttl = await redis.ttl(key);
      
      res.set('Retry-After', String(ttl));
      res.status(429).json({
        error: 'Too Many Requests',
        message: `You have exceeded the limit of ${RATE_LIMIT} requests per minute.`,
        retryAfter: ttl
      });
      return; 
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next(); 
  }
};
