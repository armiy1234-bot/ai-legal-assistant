CREATE TABLE "ai_prompts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"system_prompt" text NOT NULL,
	"category" text,
	"model_hint" text,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "ai_prompts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "court_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_number" text,
	"court" text,
	"decision_date" timestamp,
	"category" text,
	"region" text DEFAULT 'RF',
	"full_text" text,
	"summary" text,
	"embedding" vector(1536),
	"source_url" text,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "court_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "lawyer_consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"query_id" uuid,
	"status" text DEFAULT 'pending',
	"lawyer_id" uuid,
	"scheduled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "legal_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"category" text,
	"question" text NOT NULL,
	"ai_response" text,
	"model_used" text,
	"tokens_used" integer,
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"endpoint" text,
	"ip_hash" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vk_id" text,
	"telegram_id" text,
	"phone" text,
	"role" text DEFAULT 'user' NOT NULL,
	"daily_free_queries" integer DEFAULT 0,
	"last_query_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_vk_id_unique" UNIQUE("vk_id"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "lawyer_consultations" ADD CONSTRAINT "lawyer_consultations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lawyer_consultations" ADD CONSTRAINT "lawyer_consultations_query_id_legal_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."legal_queries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lawyer_consultations" ADD CONSTRAINT "lawyer_consultations_lawyer_id_users_id_fk" FOREIGN KEY ("lawyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_queries" ADD CONSTRAINT "legal_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_court_cases_embedding" ON "court_cases" USING ivfflat ("embedding" vector_cosine_ops);