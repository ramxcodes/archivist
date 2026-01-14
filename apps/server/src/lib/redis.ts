import { env } from "@archivist/env/server";
import Redis from "ioredis";

const REDIS_CONFIG = {
  maxRetriesPerRequest: 3,
  maxRetryDelay: 3000,
  retryDelayBase: 100,
} as const;

export const redis = new Redis(env.REDIS_DATABASE_URL, {
  maxRetriesPerRequest: REDIS_CONFIG.maxRetriesPerRequest,
  retryStrategy: (times: number) => {
    if (times > REDIS_CONFIG.maxRetriesPerRequest) {
      console.error(
        `[Redis] Connection failed after ${REDIS_CONFIG.maxRetriesPerRequest} retries`
      );
      return null;
    }
    return Math.min(times * REDIS_CONFIG.retryDelayBase, REDIS_CONFIG.maxRetryDelay);
  },
  lazyConnect: false,
  enableReadyCheck: true,
});

redis.on("error", (err: Error) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully");
});

/** Verifies Redis connection at startup. Throws if unavailable. */
export async function verifyRedisConnection(): Promise<void> {
  try {
    const response = await redis.ping();
    if (response !== "PONG") {
      throw new Error(`Unexpected PING response: ${response}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`[Redis] Failed to verify connection: ${message}`);
  }
}

/** Gracefully closes the Redis connection. */
export async function closeRedisConnection(): Promise<void> {
  try {
    await redis.quit();
    console.log("[Redis] Connection closed gracefully");
  } catch (error) {
    console.error("[Redis] Error closing connection:", error);
    redis.disconnect();
  }
}
