import { integer, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  sourceType: text("source_type").notNull().default("upload"),
  sourceUrl: text("source_url"),
  sourcePlatform: text("source_platform").notNull().default("file"),
  originalFilename: text("original_filename"),
  videoPath: text("video_path"),
  thumbnailPath: text("thumbnail_path"),
  durationSeconds: real("duration_seconds").notNull().default(0),
  width: integer("width").notNull().default(0),
  height: integer("height").notNull().default(0),
  status: text("status").notNull().default("processing"),
  vibe: text("vibe").notNull().default("hype"),
  targetPlatforms: text("target_platforms").notNull().default("tiktok,youtube,facebook"),
  clipLength: text("clip_length").notNull().default("auto"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const clips = pgTable("clips", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  hook: text("hook").notNull(),
  caption: text("caption").notNull(),
  captionStyle: text("caption_style").notNull().default("impact"),
  captionFont: text("caption_font").notNull().default("dejavu"),
  resolution: text("resolution").notNull().default("1080"),
  platform: text("platform").notNull().default("tiktok"),
  startSeconds: real("start_seconds").notNull(),
  endSeconds: real("end_seconds").notNull(),
  viralityScore: integer("virality_score").notNull().default(80),
  hashtags: text("hashtags").notNull().default(""),
  description: text("description").notNull().default(""),
  reason: text("reason").notNull().default(""),
  kind: text("kind").notNull().default("hook"),
  thumbnailPath: text("thumbnail_path"),
  originalPath: text("original_path"),
  renderedPath: text("rendered_path"),
  renderKey: text("render_key"),
  variantsJson: text("variants_json").notNull().default("[]"),
  status: text("status").notNull().default("ready"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Clip = typeof clips.$inferSelect;
export type NewClip = typeof clips.$inferInsert;

export const deletionRequests = pgTable("deletion_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email"),
  projectIds: text("project_ids").notNull().default(""),
  details: text("details").notNull().default(""),
  status: text("status").notNull().default("received"),
  deletedCount: integer("deleted_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
