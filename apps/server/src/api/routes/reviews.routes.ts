import express, { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validators/reviews.validator";
import { requestValidator } from "../validators";

const router: express.Router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.post("/", requestValidator(createReviewSchema), createReview);
router.put("/:id", requestValidator(updateReviewSchema), updateReview);
router.delete("/:id", deleteReview);

export default router;
