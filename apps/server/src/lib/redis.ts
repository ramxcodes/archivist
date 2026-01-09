import { env } from "@archivist/env/server";
import Redis from "ioredis";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!env.REDIS_DATABASE_URL) {
    throw new Error(
      "REDIS_DATABASE_URL is required but not configured. Please set REDIS_DATABASE_URL in your environment variables."
    );
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_DATABASE_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      redisClient.on("connect", () => {
        console.log("Redis Client Connected");
      });
    } catch (error) {
      console.error("Failed to create Redis client:", error);
      throw new Error(
        `Failed to connect to Redis: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
