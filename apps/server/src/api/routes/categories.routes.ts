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
import { requestValidator } from "../validators";

const router: express.Router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get("/", getCategories);
router.post("/", requestValidator(createCategorySchema), createCategory);
router.put("/:id", requestValidator(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
