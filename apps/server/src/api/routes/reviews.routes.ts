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

const router: express.Router = Router();

// Validation middleware
const validateCreateReview = (req: any, res: any, next: any) => {
  try {
    createReviewSchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      message: "Validation error",
      errors: error.errors,
    });
  }
};

const validateUpdateReview = (req: any, res: any, next: any) => {
  try {
    updateReviewSchema.parse(req.body);
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
router.post("/", validateCreateReview, createReview);
router.put("/:id", validateUpdateReview, updateReview);
router.delete("/:id", deleteReview);

export default router;
