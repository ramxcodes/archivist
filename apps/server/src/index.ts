import { auth } from "@quarter/auth";
import { env } from "@quarter/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
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

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
