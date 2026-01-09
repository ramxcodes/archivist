import express, { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getProfileSettings,
  updateProfileSettings,
  getPublicProfile,
} from "../controllers/profile.controller";
import { updateProfileSettingsSchema } from "../validators/profile.validator";
import { requestValidator } from "../validators";

const router: express.Router = Router();

// Authenticated routes
router.get("/settings", authenticate, getProfileSettings);
router.put(
  "/settings",
  authenticate,
  requestValidator(updateProfileSettingsSchema),
  updateProfileSettings
);

// Public routes (no authentication required)
router.get("/:userId", getPublicProfile);
router.get("/slug/:slug", getPublicProfile);

export default router;
