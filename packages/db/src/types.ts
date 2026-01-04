import type { InferSelectModel } from "drizzle-orm";
import * as schema from "./schema";

export type User = InferSelectModel<typeof schema.user>;
export type DayEntry = InferSelectModel<typeof schema.dayEntry>;
export type Review = InferSelectModel<typeof schema.review>;
export type CustomCategory = InferSelectModel<typeof schema.customCategory>;
export type ProfileSettings = InferSelectModel<typeof schema.profileSettings>;
