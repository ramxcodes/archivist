import express, { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/categories.validator";

const router: express.Router = Router();

// Validation middleware
const validateCreateCategory = (req: any, res: any, next: any) => {
  try {
    createCategorySchema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      message: "Validation error",
      errors: error.errors,
    });
  }
};

const validateUpdateCategory = (req: any, res: any, next: any) => {
  try {
    updateCategorySchema.parse(req.body);
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
router.get("/", getCategories);
router.post("/", validateCreateCategory, createCategory);
router.put("/:id", validateUpdateCategory, updateCategory);
router.delete("/:id", deleteCategory);

export default router;
