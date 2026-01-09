import { auth } from "@archivist/auth";
import { env } from "@archivist/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { rateLimiter } from "./api/middleware/rate-limiter.middleware";
import daysRoutes from "./api/routes/days.routes";
import reviewsRoutes from "./api/routes/reviews.routes";
import categoriesRoutes from "./api/routes/categories.routes";
import profileRoutes from "./api/routes/profile.routes";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(express.json());
app.use(rateLimiter);

// Routes
app.use("/api/days", daysRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "OK! API is running",
  });
});
app.listen(3009, () => {
  console.log("Server is running on http://localhost:3009");
  console.log("Environment variables:", {
    DATABASE_URL: env.DATABASE_URL
      ? env.DATABASE_URL.substring(0, 3) + "..."
      : "❌ undefined",
    REDIS_DATABASE_URL: env.REDIS_DATABASE_URL
      ? env.REDIS_DATABASE_URL.substring(0, 3) + "..."
      : "❌ undefined",
    RATE_LIMIT: env.RATE_LIMIT,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET
      ? env.BETTER_AUTH_SECRET.substring(0, 3) + "..."
      : "❌ undefined",
    BETTER_AUTH_URL: env.BETTER_AUTH_URL
      ? env.BETTER_AUTH_URL.substring(0, 3) + "..."
      : "❌ undefined",
    CORS_ORIGIN: env.CORS_ORIGIN
      ? env.CORS_ORIGIN.substring(0, 3) + "..."
      : "❌ undefined",
    NODE_ENV: env.NODE_ENV
      ? env.NODE_ENV.substring(0, 3) + "..."
      : "❌ undefined",
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID
      ? env.GOOGLE_CLIENT_ID.substring(0, 3) + "..."
      : "❌ undefined",
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET
      ? env.GOOGLE_CLIENT_SECRET.substring(0, 3) + "..."
      : "❌ undefined",
  });
});
