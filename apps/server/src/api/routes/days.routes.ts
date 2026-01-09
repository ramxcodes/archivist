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
import { requestValidator } from "../validators";

const router: express.Router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get("/2026", getYearEntries);
router.get("/:date", getDayEntry);
router.post(
  "/",
  requestValidator(createDayEntrySchema),
  createOrUpdateDayEntry
);
router.put("/:date", requestValidator(updateDayEntrySchema), updateDayEntry);
router.delete("/:date", deleteDayEntry);

export default router;
