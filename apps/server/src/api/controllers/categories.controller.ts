import { db, eq, and, count } from "@quarter/db";
import { customCategory } from "@quarter/db/schema/calendar";
import type { Request, Response } from "express";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validators/categories.validator";

// GET /api/categories - Get user's custom categories
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const categories = await db
      .select()
      .from(customCategory)
      .where(eq(customCategory.userId, userId))
      .orderBy(customCategory.order);

    res.status(200).json({
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      message: "An error occurred while fetching categories",
    });
  }
};

// POST /api/categories - Create custom category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, isRequired, order } = req.body as CreateCategoryInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Check if user already has 3 custom categories
    const [categoryCount] = await db
      .select({ count: count() })
      .from(customCategory)
      .where(eq(customCategory.userId, userId));

    if (categoryCount && categoryCount.count >= 3) {
      res.status(400).json({
        message: "Maximum of 3 custom categories allowed",
      });
      return;
    }

    // Check if the order is already taken
    const [existingCategory] = await db
      .select()
      .from(customCategory)
      .where(
        and(eq(customCategory.userId, userId), eq(customCategory.order, order))
      )
      .limit(1);

    if (existingCategory) {
      res.status(400).json({
        message: `Order ${order} is already taken`,
      });
      return;
    }

    // Create the category
    const [newCategory] = await db
      .insert(customCategory)
      .values({
        id: crypto.randomUUID(),
        userId,
        name,
        isRequired,
        order,
      })
      .returning();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "An error occurred while creating the category",
    });
  }
};

// PUT /api/categories/:id - Update custom category
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, isRequired } = req.body as UpdateCategoryInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        message: "Category ID is required",
      });
      return;
    }

    // Verify the category exists and belongs to the user
    const [existingCategory] = await db
      .select()
      .from(customCategory)
      .where(and(eq(customCategory.id, id), eq(customCategory.userId, userId)))
      .limit(1);

    if (!existingCategory) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }

    // Update the category
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (isRequired !== undefined) updateData.isRequired = isRequired;

    const [updatedCategory] = await db
      .update(customCategory)
      .set(updateData)
      .where(eq(customCategory.id, id))
      .returning();

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "An error occurred while updating the category",
    });
  }
};

// DELETE /api/categories/:id - Delete custom category
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        message: "Category ID is required",
      });
      return;
    }

    // Verify the category exists and belongs to the user
    const [existingCategory] = await db
      .select()
      .from(customCategory)
      .where(and(eq(customCategory.id, id), eq(customCategory.userId, userId)))
      .limit(1);

    if (!existingCategory) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }

    // Delete the category (reviews will be cascade deleted)
    await db.delete(customCategory).where(eq(customCategory.id, id));

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "An error occurred while deleting the category",
    });
  }
};
