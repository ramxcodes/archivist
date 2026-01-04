import express, { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getYearEntries,
  getDayEntry,
  createOrUpdateDayEntry,
  updateDayEntry,
  deleteDayEntry,
} from "../controllers/days.controller";
import {
  createDayEntrySchema,
  updateDayEntrySchema,
} from "../validators/days.validator";

const router: express.Router = Router();

// Validation middleware
const validateCreateDayEntry = (req: any, res: any, next: any) => {
  try {
    createDayEntrySchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      message: "Validation error",
      errors: error.errors,
    });
  }
};

const validateUpdateDayEntry = (req: any, res: any, next: any) => {
  try {
    updateDayEntrySchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      message: "Validation error",
      errors: error.errors,
    });
  }
};

// All routes require authentication
router.use(authenticate);

// Routes
router.get("/2026", getYearEntries);
router.get("/:date", getDayEntry);
router.post("/", validateCreateDayEntry, createOrUpdateDayEntry);
router.put("/:date", validateUpdateDayEntry, updateDayEntry);
router.delete("/:date", deleteDayEntry);

export default router;
