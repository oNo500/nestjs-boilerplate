ALTER TABLE "articles" ADD COLUMN "category" text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "author" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;