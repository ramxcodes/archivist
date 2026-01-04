import { z } from "zod";

const legendEnum = z.enum([
  "CORE_MEMORY",
  "GOOD_DAY",
  "NEUTRAL",
  "BAD_DAY",
  "NIGHTMARE",
]);

const dateValidator = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => {
    const d = new Date(date);
    return d.getFullYear() === 2026;
  }, "Date must be in year 2026")
  .refine((date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return d <= today;
  }, "Cannot create entries for future dates");

export const createDayEntrySchema = z.object({
  date: dateValidator,
  legend: legendEnum,
});

export const updateDayEntrySchema = z.object({
  legend: legendEnum,
});

export type CreateDayEntryInput = z.infer<typeof createDayEntrySchema>;
export type UpdateDayEntryInput = z.infer<typeof updateDayEntrySchema>;
