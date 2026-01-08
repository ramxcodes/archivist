import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    REDIS_DATABASE_URL: z.string().min(1),
    RATE_LIMIT: z
      .string()
      .regex(/^\d+$/)
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .default("50"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
