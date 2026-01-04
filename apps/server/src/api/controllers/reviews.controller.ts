import { db, eq, and } from "@quarter/db";
import { review, dayEntry, customCategory } from "@quarter/db/schema/calendar";
import type { Request, Response } from "express";
import type {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validators/reviews.validator";

// POST /api/reviews - Add review to a day entry
export const createReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { dayEntryId, category, customCategoryId, content } =
      req.body as CreateReviewInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Verify the day entry exists and belongs to the user
    const [entry] = await db
      .select()
      .from(dayEntry)
      .where(and(eq(dayEntry.id, dayEntryId), eq(dayEntry.userId, userId)))
      .limit(1);

    if (!entry) {
      res.status(404).json({
        message: "Day entry not found",
      });
      return;
    }

    // If category is CUSTOM, verify the custom category exists and belongs to the user
    if (category === "CUSTOM" && customCategoryId) {
      const [customCat] = await db
        .select()
        .from(customCategory)
        .where(
          and(
            eq(customCategory.id, customCategoryId),
            eq(customCategory.userId, userId)
          )
        )
        .limit(1);

      if (!customCat) {
        res.status(404).json({
          message: "Custom category not found",
        });
        return;
      }
    }

    // Check if a review with the same category already exists for this day entry
    const existingReviews = await db
      .select()
      .from(review)
      .where(
        and(
          eq(review.dayEntryId, dayEntryId),
          eq(review.category, category),
          category === "CUSTOM" && customCategoryId
            ? eq(review.customCategoryId, customCategoryId)
            : undefined
        )
      );

    if (existingReviews.length > 0) {
      res.status(400).json({
        message: "A review for this category already exists for this day",
      });
      return;
    }

    // Create the review
    const [newReview] = await db
      .insert(review)
      .values({
        id: crypto.randomUUID(),
        dayEntryId,
        category,
        customCategoryId: customCategoryId || null,
        content,
      })
      .returning();

    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      message: "An error occurred while creating the review",
    });
  }
};

// PUT /api/reviews/:id - Update review
export const updateReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { content } = req.body as UpdateReviewInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        message: "Review ID is required",
      });
      return;
    }

    // Verify the review exists and belongs to the user
    const [existingReview] = await db
      .select({
        review,
        dayEntry,
      })
      .from(review)
      .innerJoin(dayEntry, eq(review.dayEntryId, dayEntry.id))
      .where(and(eq(review.id, id), eq(dayEntry.userId, userId)))
      .limit(1);

    if (!existingReview) {
      res.status(404).json({
        message: "Review not found",
      });
      return;
    }

    // Update the review
    const [updatedReview] = await db
      .update(review)
      .set({ content, updatedAt: new Date() })
      .where(eq(review.id, id))
      .returning();

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      message: "An error occurred while updating the review",
    });
  }
};

// DELETE /api/reviews/:id - Delete review
export const deleteReview = async (
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
        message: "Review ID is required",
      });
      return;
    }

    // Verify the review exists and belongs to the user
    const [existingReview] = await db
      .select({
        review,
        dayEntry,
      })
      .from(review)
      .innerJoin(dayEntry, eq(review.dayEntryId, dayEntry.id))
      .where(and(eq(review.id, id), eq(dayEntry.userId, userId)))
      .limit(1);

    if (!existingReview) {
      res.status(404).json({
        message: "Review not found",
      });
      return;
    }

    // Delete the review
    await db.delete(review).where(eq(review.id, id));

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      message: "An error occurred while deleting the review",
    });
  }
};
