import { z } from "zod";

export const updateProfileSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  showMoods: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  showStats: z.boolean().optional(),
  publicSlug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Public slug must contain only lowercase letters, numbers, and hyphens"
    )
    .min(3, "Public slug must be at least 3 characters")
    .max(50, "Public slug must be 50 characters or less")
    .optional()
    .nullable(),
});

export type UpdateProfileSettingsInput = z.infer<
  typeof updateProfileSettingsSchema
>;
