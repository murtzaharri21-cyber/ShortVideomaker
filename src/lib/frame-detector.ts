import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clips, projects } from "@/db/schema";
import { buildCaptionPack, type ClipKind } from "@/lib/captions";
import { isPlatform, isVibe } from "@/lib/constants";
import { detectSceneChanges, extractFrames, probeVideo, takeScreenshot } from "@/lib/ffmpeg";
import { ensureDir, fileExists, fromRelPath, mediaAbs, toRelPath } from "@/lib/storage";
import { clamp } from "@/lib/utils";

export type DetectedFrame = {
  index: number;
  timestamp: number;
  score: number;
  reason: string;
  thumbnailUrl: string;
};

export type DetectionResult = {
  frames: DetectedFrame[];
  clipCount: number;
};

/**
 * Samples frames across the source and scores each one on motion energy and
 * contrast so the "viral" picks land on visually busy moments instead of
 * evenly spaced slices.
 */
export async function detectViralFrames(opts: {
  projectId: string;
  sampleCount?: number;
  clipLength?: number;
  onProgress?: (done: number, total: number) => void;
}) {
  const [project] = await db.select().from(projects).where(eq(projects.id, opts.projectId)).limit(1);
  if (!project) throw new Error("Project not found.");
  if (!project.videoPath) throw new Error("This project still needs a source video.");

  const input = fromRelPath(project.videoPath);
  if (!(await fileExists(input))) throw new Error("The source video is missing.");
  const info = await probeVideo(input);
  const duration = info.duration;

  const framesDir = mediaAbs("projects", opts.projectId, "frames");
  await ensureDir(framesDir);

  const sampleCount = clamp(opts.sampleCount ?? 14, 4, 40);
  const safeClipLength = clamp(opts.clipLength ?? 15, 5, 60);
  const minSpacing = Math.max(6, safeClipLength * 0.75);
  const regularCandidates = Array.from({ length: sampleCount }, (_, index) => ({
    timestamp: Number(clamp((duration * (index + 0.5)) / sampleCount, 0.2, Math.max(0.2, duration - 0.2)).toFixed(3)),
    score: 60,
    reason: "Coverage pick — review this moment for a useful setup or payoff.",
  }));
  const sceneChanges = await detectSceneChanges(input);
  const candidates = [
    ...regularCandidates,
    ...sceneChanges.map((change) => ({
      timestamp: Number(clamp(change.timestamp, 0.2, Math.max(0.2, duration - 0.2)).toFixed(3)),
      score: Math.round(clamp(68 + change.score * 60, 60, 98)),
      reason: "A clear visual scene change may mark a new beat. Review it for a strong clip.",
    })),
  ].sort((a, b) => b.score - a.score);

  const selected: typeof candidates = [];
  for (const candidate of candidates) {
    if (selected.every((item) => Math.abs(item.timestamp - candidate.timestamp) >= minSpacing)) {
      selected.push(candidate);
      if (selected.length >= 8) break;
    }
  }
  selected.sort((a, b) => a.timestamp - b.timestamp);

  const extracted = await extractFrames({
    input,
    outputDir: framesDir,
    timestamps: selected.map((candidate) => candidate.timestamp),
    width: 320,
  });
  const frames: DetectedFrame[] = extracted.map((frame, index) => ({
    index,
    timestamp: frame.timestamp,
    score: selected[index]?.score ?? 60,
    reason: selected[index]?.reason ?? "Review this moment for a useful clip.",
    thumbnailUrl: `/api/media?p=${encodeURIComponent(toRelPath(frame.path))}`,
  }));

  opts.onProgress?.(extracted.length, selected.length);

  return { project, info, frames, duration };
}

export async function createClipsFromFrames(opts: {
  projectId: string;
  frames: { timestamp: number; score: number; reason: string }[];
  clipLength: string;
  vibe: string;
  platforms: string[];
}) {
  const [project] = await db.select().from(projects).where(eq(projects.id, opts.projectId)).limit(1);
  if (!project) throw new Error("Project not found.");

  const duration = project.durationSeconds;
  const length = clamp(Number(opts.clipLength) || 15, 5, Math.max(5, duration));
  const vibe = isVibe(opts.vibe) ? opts.vibe : "hype";
  const platforms = opts.platforms.filter(isPlatform);
  const kinds: ClipKind[] = ["hook", "turn", "climax", "payoff", "cta", "hook", "turn", "climax"];

  await db.delete(clips).where(eq(clips.projectId, opts.projectId));

  const created = [];
  for (const [index, frame] of opts.frames.slice(0, 8).entries()) {
    const start = Number(clamp(frame.timestamp - length * 0.25, 0, Math.max(0, duration - length)).toFixed(3));
    const end = Number(clamp(start + length, start + 3, duration).toFixed(3));
    const platform = platforms[index % Math.max(platforms.length, 1)] ?? "tiktok";
    const kind = kinds[index % kinds.length];
    const pack = buildCaptionPack({ vibe, platform, kind, index, sourceTitle: project.title });

    const clipId = crypto.randomUUID();
    const thumbAbs = mediaAbs("projects", opts.projectId, "clips", `${clipId}.jpg`);
    const stamp = clamp(start + Math.min(1.2, (end - start) * 0.25), 0.05, Math.max(0.1, duration - 0.05));
    try {
      await takeScreenshot(fromRelPath(project.videoPath!), thumbAbs, stamp);
    } catch {
      // preview falls back to the project thumbnail
    }

    const [row] = await db
      .insert(clips)
      .values({
        id: clipId,
        projectId: opts.projectId,
        title: pack.title,
        hook: pack.hook,
        caption: pack.caption,
        captionStyle: pack.style,
        captionFont: "dejavu",
        resolution: "1080",
        platform,
        startSeconds: start,
        endSeconds: end,
        viralityScore: frame.score,
        hashtags: pack.hashtags,
        description: pack.description,
        reason: frame.reason || pack.reason,
        kind,
        thumbnailPath: (await fileExists(thumbAbs)) ? toRelPath(thumbAbs) : project.thumbnailPath,
        variantsJson: JSON.stringify(pack.variants),
        status: "ready",
      })
      .returning();
    if (row) created.push(row);
  }

  await db
    .update(projects)
    .set({ status: "ready", errorMessage: null, updatedAt: new Date() })
    .where(eq(projects.id, opts.projectId));

  return created;
}
