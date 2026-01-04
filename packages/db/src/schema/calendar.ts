import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  date,
  integer,
  index,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enums
export const legendEnum = pgEnum("legend", [
  "CORE_MEMORY",
  "GOOD_DAY",
  "NEUTRAL",
  "BAD_DAY",
  "NIGHTMARE",
]);

export const reviewCategoryEnum = pgEnum("review_category", [
  "WORK",
  "PERSONAL",
  "LEARNING",
  "CUSTOM",
]);

// Day Entry Table
export const dayEntry = pgTable(
  "day_entry",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    legend: legendEnum("legend").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("day_entry_user_id_idx").on(table.userId),
    index("day_entry_date_idx").on(table.date),
    unique("day_entry_user_date_unique").on(table.userId, table.date),
  ]
);

// Custom Category Table
export const customCategory = pgTable(
  "custom_category",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("custom_category_user_id_idx").on(table.userId),
    unique("custom_category_user_order_unique").on(table.userId, table.order),
  ]
);

// Review Table
export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    dayEntryId: text("day_entry_id")
      .notNull()
      .references(() => dayEntry.id, { onDelete: "cascade" }),
    category: reviewCategoryEnum("category").notNull(),
    customCategoryId: text("custom_category_id").references(
      () => customCategory.id,
      { onDelete: "cascade" }
    ),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("review_day_entry_id_idx").on(table.dayEntryId)]
);

// Profile Settings Table
export const profileSettings = pgTable(
  "profile_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    isPublic: boolean("is_public").default(false).notNull(),
    showMoods: boolean("show_moods").default(true).notNull(),
    showReviews: boolean("show_reviews").default(false).notNull(),
    showStats: boolean("show_stats").default(true).notNull(),
    publicSlug: text("public_slug").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("profile_settings_user_id_idx").on(table.userId)]
);

// Relations
export const dayEntryRelations = relations(dayEntry, ({ one, many }) => ({
  user: one(user, {
    fields: [dayEntry.userId],
    references: [user.id],
  }),
  reviews: many(review),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  dayEntry: one(dayEntry, {
    fields: [review.dayEntryId],
    references: [dayEntry.id],
  }),
  customCategory: one(customCategory, {
    fields: [review.customCategoryId],
    references: [customCategory.id],
  }),
}));

export const customCategoryRelations = relations(
  customCategory,
  ({ one, many }) => ({
    user: one(user, {
      fields: [customCategory.userId],
      references: [user.id],
    }),
    reviews: many(review),
  })
);

export const profileSettingsRelations = relations(
  profileSettings,
  ({ one }) => ({
    user: one(user, {
      fields: [profileSettings.userId],
      references: [user.id],
    }),
  })
);
