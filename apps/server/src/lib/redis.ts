import { env } from "@archivist/env/server";
import { Redis } from "ioredis";

export const redis = new Redis(env.REDIS_DATABASE_URL, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
