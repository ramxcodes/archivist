import { db, eq, and, gte, lte, inArray } from "@quarter/db";
import { profileSettings, dayEntry, review } from "@quarter/db/schema/calendar";
import { user } from "@quarter/db/schema/auth";
import type { Request, Response } from "express";
import type { UpdateProfileSettingsInput } from "../validators/profile.validator";

// Helper function to generate default slug from email
const generateDefaultSlug = (email: string): string => {
  const username = email.split("@")[0];
  if (!username) return "user";
  return username.toLowerCase().replace(/[^a-z0-9-]/g, "-");
};

// GET /api/profile/settings - Get authenticated user's profile settings
export const getProfileSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    let [settings] = await db
      .select()
      .from(profileSettings)
      .where(eq(profileSettings.userId, userId))
      .limit(1);

    // If settings don't exist, create default settings with default slug
    if (!settings) {
      const defaultSlug = userEmail ? generateDefaultSlug(userEmail) : null;

      [settings] = await db
        .insert(profileSettings)
        .values({
          id: crypto.randomUUID(),
          userId,
          isPublic: false,
          showMoods: true,
          showReviews: false,
          showStats: true,
          publicSlug: defaultSlug,
        })
        .returning();
    }

    res.status(200).json({
      settings,
    });
  } catch (error) {
    console.error("Error fetching profile settings:", error);
    res.status(500).json({
      message: "An error occurred while fetching profile settings",
    });
  }
};

// PUT /api/profile/settings - Update profile settings
export const updateProfileSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { isPublic, showMoods, showReviews, showStats, publicSlug } =
      req.body as UpdateProfileSettingsInput;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Check if publicSlug is already taken by another user
    if (publicSlug && publicSlug.trim() !== "") {
      const [existingSlug] = await db
        .select()
        .from(profileSettings)
        .where(eq(profileSettings.publicSlug, publicSlug))
        .limit(1);

      // If slug exists and doesn't belong to current user
      if (existingSlug && existingSlug.userId !== userId) {
        res.status(400).json({
          message: "This public slug is already taken",
        });
        return;
      }
    }

    // Get or create settings
    let [settings] = await db
      .select()
      .from(profileSettings)
      .where(eq(profileSettings.userId, userId))
      .limit(1);

    if (!settings) {
      // Create new settings with default slug if not provided
      const defaultSlug = userEmail ? generateDefaultSlug(userEmail) : null;
      const slugToUse =
        publicSlug !== undefined ? publicSlug || null : defaultSlug;

      [settings] = await db
        .insert(profileSettings)
        .values({
          id: crypto.randomUUID(),
          userId,
          isPublic: isPublic ?? false,
          showMoods: showMoods ?? true,
          showReviews: showReviews ?? false,
          showStats: showStats ?? true,
          publicSlug: slugToUse,
        })
        .returning();
    } else {
      // Update existing settings
      const updateData: any = { updatedAt: new Date() };
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (showMoods !== undefined) updateData.showMoods = showMoods;
      if (showReviews !== undefined) updateData.showReviews = showReviews;
      if (showStats !== undefined) updateData.showStats = showStats;
      if (publicSlug !== undefined) updateData.publicSlug = publicSlug || null;

      [settings] = await db
        .update(profileSettings)
        .set(updateData)
        .where(eq(profileSettings.id, settings.id))
        .returning();
    }

    res.status(200).json({
      message: "Profile settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating profile settings:", error);
    res.status(500).json({
      message: "An error occurred while updating profile settings",
    });
  }
};

// GET /api/profile/:userId or /api/profile/slug/:slug - Get public profile
export const getPublicProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, slug } = req.params;
    let targetUserId: string | undefined;

    // Find user by slug or userId
    if (slug) {
      // Explicit slug route: /api/profile/slug/:slug
      const [settings] = await db
        .select()
        .from(profileSettings)
        .where(eq(profileSettings.publicSlug, slug))
        .limit(1);

      if (!settings) {
        res.status(404).json({
          message: "Profile not found",
        });
        return;
      }

      targetUserId = settings.userId;
    } else if (userId) {
      // Could be either a slug or userId: /api/profile/:userId
      // First try to find by slug
      const [settingsBySlug] = await db
        .select()
        .from(profileSettings)
        .where(eq(profileSettings.publicSlug, userId))
        .limit(1);

      if (settingsBySlug) {
        targetUserId = settingsBySlug.userId;
      } else {
        // If not found by slug, treat as userId
        targetUserId = userId;
      }
    } else {
      res.status(400).json({
        message: "User ID or slug is required",
      });
      return;
    }

    // Get profile settings
    const [settings] = await db
      .select()
      .from(profileSettings)
      .where(eq(profileSettings.userId, targetUserId))
      .limit(1);

    if (!settings || !settings.isPublic) {
      res.status(404).json({
        message: "Profile is private or does not exist",
      });
      return;
    }

    // Get user info
    const [userInfo] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!userInfo) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Build response based on visibility settings
    const response: any = {
      user: userInfo,
      settings: {
        showMoods: settings.showMoods,
        showReviews: settings.showReviews,
        showStats: settings.showStats,
      },
    };

    // Get day entries for 2026
    if (settings.showMoods || settings.showReviews || settings.showStats) {
      const entries = await db
        .select()
        .from(dayEntry)
        .where(
          and(
            eq(dayEntry.userId, targetUserId),
            gte(dayEntry.date, "2026-01-01"),
            lte(dayEntry.date, "2026-12-31")
          )
        )
        .orderBy(dayEntry.date);

      if (settings.showMoods) {
        response.entries = entries.map((entry) => ({
          date: entry.date,
          legend: entry.legend,
        }));
      }

      if (settings.showReviews) {
        // Get all reviews for the entries
        const entryIds = entries.map((e) => e.id);
        if (entryIds.length > 0) {
          const allReviews = await db
            .select()
            .from(review)
            .where(inArray(review.dayEntryId, entryIds));

          // Group reviews by day entry
          const reviewsByEntry: Record<string, any[]> = {};
          for (const rev of allReviews) {
            if (!reviewsByEntry[rev.dayEntryId]) {
              reviewsByEntry[rev.dayEntryId] = [];
            }
            reviewsByEntry[rev.dayEntryId]!.push(rev);
          }

          response.reviews = reviewsByEntry;
        }
      }

      if (settings.showStats) {
        const totalEntries = entries.length;
        const goodDaysCount = entries.filter(
          (e) => e.legend === "GOOD_DAY" || e.legend === "CORE_MEMORY"
        ).length;

        response.stats = {
          totalEntries,
          goodDaysCount,
        };
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({
      message: "An error occurred while fetching the profile",
    });
  }
};
