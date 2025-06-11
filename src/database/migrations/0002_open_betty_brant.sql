ALTER TABLE "otps" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."otp_type";--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('EMAIL_REGISTER', 'PASSWORD_RESET');--> statement-breakpoint
ALTER TABLE "otps" ALTER COLUMN "type" SET DATA TYPE "public"."otp_type" USING "type"::"public"."otp_type";--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "otps" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "username" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "name";