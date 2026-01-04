import { z } from "zod";

const reviewCategoryEnum = z.enum(["WORK", "PERSONAL", "LEARNING", "CUSTOM"]);

export const createReviewSchema = z
  .object({
    dayEntryId: z.string().min(1, "Day entry ID is required"),
    category: reviewCategoryEnum,
    customCategoryId: z.string().optional(),
    content: z.string().min(1, "Review content is required"),
  })
  .refine(
    (data) => {
      if (data.category === "CUSTOM") {
        return !!data.customCategoryId;
      }
      return true;
    },
    {
      message: "Custom category ID is required when category is CUSTOM",
      path: ["customCategoryId"],
    }
  );

export const updateReviewSchema = z.object({
  content: z.string().min(1, "Review content is required"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
