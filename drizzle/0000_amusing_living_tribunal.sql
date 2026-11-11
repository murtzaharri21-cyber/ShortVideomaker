CREATE TABLE "clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"hook" text NOT NULL,
	"caption" text NOT NULL,
	"caption_style" text DEFAULT 'impact' NOT NULL,
	"caption_font" text DEFAULT 'dejavu' NOT NULL,
	"resolution" text DEFAULT '1080' NOT NULL,
	"platform" text DEFAULT 'tiktok' NOT NULL,
	"start_seconds" real NOT NULL,
	"end_seconds" real NOT NULL,
	"virality_score" integer DEFAULT 80 NOT NULL,
	"hashtags" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'hook' NOT NULL,
	"thumbnail_path" text,
	"original_path" text,
	"rendered_path" text,
	"render_key" text,
	"variants_json" text DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deletion_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"project_ids" text DEFAULT '' NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"deleted_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"source_type" text DEFAULT 'upload' NOT NULL,
	"source_url" text,
	"source_platform" text DEFAULT 'file' NOT NULL,
	"original_filename" text,
	"video_path" text,
	"thumbnail_path" text,
	"duration_seconds" real DEFAULT 0 NOT NULL,
	"width" integer DEFAULT 0 NOT NULL,
	"height" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"vibe" text DEFAULT 'hype' NOT NULL,
	"target_platforms" text DEFAULT 'tiktok,youtube,facebook' NOT NULL,
	"clip_length" text DEFAULT 'auto' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clips" ADD CONSTRAINT "clips_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;