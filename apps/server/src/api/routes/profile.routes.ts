import express, { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getProfileSettings,
  updateProfileSettings,
  getPublicProfile,
} from "../controllers/profile.controller";
import { updateProfileSettingsSchema } from "../validators/profile.validator";

const router: express.Router = Router();

// Validation middleware
const validateUpdateProfileSettings = (req: any, res: any, next: any) => {
  try {
    updateProfileSettingsSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      message: "Validation error",
      errors: error.errors,
    });
  }
};

// Authenticated routes
router.get("/settings", authenticate, getProfileSettings);
router.put(
  "/settings",
  authenticate,
  validateUpdateProfileSettings,
  updateProfileSettings
);

// Public routes (no authentication required)
router.get("/:userId", getPublicProfile);
router.get("/slug/:slug", getPublicProfile);

export default router;
