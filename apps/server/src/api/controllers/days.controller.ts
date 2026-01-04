import { db, eq, and, gte, lte } from "@quarter/db";
import { dayEntry, review } from "@quarter/db/schema/calendar";
import type { Request, Response } from "express";
import type {
  CreateDayEntryInput,
  UpdateDayEntryInput,
} from "../validators/days.validator";

// GET /api/days/2026 - Get all day entries for authenticated user for 2026
export const getYearEntries = async (
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

    const entries = await db
      .select()
      .from(dayEntry)
      .where(
        and(
          eq(dayEntry.userId, userId),
          gte(dayEntry.date, "2026-01-01"),
          lte(dayEntry.date, "2026-12-31")
        )
      )
      .orderBy(dayEntry.date);

    res.status(200).json({
      entries,
    });
  } catch (error) {
    console.error("Error fetching year entries:", error);
    res.status(500).json({
      message: "An error occurred while fetching entries",
    });
  }
};

// GET /api/days/:date - Get specific day entry with reviews
export const getDayEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date } = req.params;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        message: "Date parameter is required",
      });
      return;
    }

    const [entry] = await db
      .select()
      .from(dayEntry)
      .where(and(eq(dayEntry.userId, userId), eq(dayEntry.date, date)))
      .limit(1);

    if (!entry) {
      res.status(404).json({
        message: "Day entry not found",
      });
      return;
    }

    // Fetch reviews for this day entry
    const reviews = await db
      .select()
      .from(review)
      .where(eq(review.dayEntryId, entry.id))
      .orderBy(review.createdAt);

    res.status(200).json({
      entry,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching day entry:", error);
    res.status(500).json({
      message: "An error occurred while fetching the day entry",
    });
  }
};

// POST /api/days - Create/update day entry
export const createOrUpdateDayEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date, legend } = req.body as CreateDayEntryInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Check if entry already exists
    const [existingEntry] = await db
      .select()
      .from(dayEntry)
      .where(and(eq(dayEntry.userId, userId), eq(dayEntry.date, date)))
      .limit(1);

    if (existingEntry) {
      // Update existing entry
      const [updatedEntry] = await db
        .update(dayEntry)
        .set({ legend, updatedAt: new Date() })
        .where(eq(dayEntry.id, existingEntry.id))
        .returning();

      res.status(200).json({
        message: "Day entry updated successfully",
        entry: updatedEntry,
      });
      return;
    }

    // Create new entry
    const [newEntry] = await db
      .insert(dayEntry)
      .values({
        id: crypto.randomUUID(),
        userId,
        date,
        legend,
      })
      .returning();

    res.status(201).json({
      message: "Day entry created successfully",
      entry: newEntry,
    });
  } catch (error) {
    console.error("Error creating/updating day entry:", error);
    res.status(500).json({
      message: "An error occurred while saving the day entry",
    });
  }
};

// PUT /api/days/:date - Update day entry legend only
export const updateDayEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date } = req.params;
    const { legend } = req.body as UpdateDayEntryInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        message: "Date parameter is required",
      });
      return;
    }

    const [existingEntry] = await db
      .select()
      .from(dayEntry)
      .where(and(eq(dayEntry.userId, userId), eq(dayEntry.date, date)))
      .limit(1);

    if (!existingEntry) {
      res.status(404).json({
        message: "Day entry not found",
      });
      return;
    }

    const [updatedEntry] = await db
      .update(dayEntry)
      .set({ legend, updatedAt: new Date() })
      .where(eq(dayEntry.id, existingEntry.id))
      .returning();

    res.status(200).json({
      message: "Day entry updated successfully",
      entry: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating day entry:", error);
    res.status(500).json({
      message: "An error occurred while updating the day entry",
    });
  }
};

// DELETE /api/days/:date - Delete day entry and associated reviews
export const deleteDayEntry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { date } = req.params;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        message: "Date parameter is required",
      });
      return;
    }

    const [existingEntry] = await db
      .select()
      .from(dayEntry)
      .where(and(eq(dayEntry.userId, userId), eq(dayEntry.date, date)))
      .limit(1);

    if (!existingEntry) {
      res.status(404).json({
        message: "Day entry not found",
      });
      return;
    }

    // Delete the entry (reviews will be cascade deleted)
    await db.delete(dayEntry).where(eq(dayEntry.id, existingEntry.id));

    res.status(200).json({
      message: "Day entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting day entry:", error);
    res.status(500).json({
      message: "An error occurred while deleting the day entry",
    });
  }
};
