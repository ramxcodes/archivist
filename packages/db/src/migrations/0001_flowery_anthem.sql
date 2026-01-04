CREATE TYPE "public"."legend" AS ENUM('CORE_MEMORY', 'GOOD_DAY', 'NEUTRAL', 'BAD_DAY', 'NIGHTMARE');--> statement-breakpoint
CREATE TYPE "public"."review_category" AS ENUM('WORK', 'PERSONAL', 'LEARNING', 'CUSTOM');--> statement-breakpoint
CREATE TABLE "custom_category" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_category_user_order_unique" UNIQUE("user_id","order")
);
--> statement-breakpoint
CREATE TABLE "day_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"legend" "legend" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "day_entry_user_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "profile_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"show_moods" boolean DEFAULT true NOT NULL,
	"show_reviews" boolean DEFAULT false NOT NULL,
	"show_stats" boolean DEFAULT true NOT NULL,
	"public_slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_settings_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profile_settings_public_slug_unique" UNIQUE("public_slug")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"day_entry_id" text NOT NULL,
	"category" "review_category" NOT NULL,
	"custom_category_id" text,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_category" ADD CONSTRAINT "custom_category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_entry" ADD CONSTRAINT "day_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_settings" ADD CONSTRAINT "profile_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_day_entry_id_day_entry_id_fk" FOREIGN KEY ("day_entry_id") REFERENCES "public"."day_entry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_custom_category_id_custom_category_id_fk" FOREIGN KEY ("custom_category_id") REFERENCES "public"."custom_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_category_user_id_idx" ON "custom_category" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "day_entry_user_id_idx" ON "day_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "day_entry_date_idx" ON "day_entry" USING btree ("date");--> statement-breakpoint
CREATE INDEX "profile_settings_user_id_idx" ON "profile_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_day_entry_id_idx" ON "review" USING btree ("day_entry_id");