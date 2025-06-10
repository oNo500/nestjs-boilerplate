CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."otp_type" AS ENUM('EMAIL_VERIFICATION', 'EMAIL_CONFIRMATION', 'PASSWORD_RESET');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" text DEFAULT 'unknown',
	"location" text DEFAULT 'unknown',
	"device_os" text DEFAULT 'unknown',
	"device_name" text DEFAULT 'unknown',
	"device_type" text DEFAULT 'unknown',
	"browser" text DEFAULT 'unknown',
	"user_agent" text DEFAULT 'unknown',
	"refresh_token" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"gender" "gender" DEFAULT 'UNKNOWN' NOT NULL,
	"phone_number" varchar(50),
	"profile_picture" text,
	"date_of_birth" timestamp with time zone,
	"address" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "profiles_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text,
	"username" varchar(255) NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;