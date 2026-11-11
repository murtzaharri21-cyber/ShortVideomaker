import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { clips, projects, type Clip, type Project } from "@/db/schema";
import { buildCaptionPack, type ClipKind } from "@/lib/captions";
import {
  isCaptionFont,
  isCaptionStyle,
  isClipLength,
  isPlatform,
  isResolution,
  isVibe,
  type CaptionFontId,
  type CaptionStyleId,
  type ClipLengthId,
  type PlatformId,
  type ResolutionId,
  type VibeId,
} from "@/lib/constants";
import { probeVideo, takeScreenshot } from "@/lib/ffmpeg";
import { ensureProjectDirs, fileExists, fromRelPath, mediaAbs, toRelPath } from "@/lib/storage";
import { clamp, parseJsonArray } from "@/lib/utils";

export type PlannedWindow = {
  start: number;
  end: number;
  kind: ClipKind;
  score: number;
};

export type ClipDTO = {
  id: string;
  projectId: string;
  title: string;
  hook: string;
  caption: string;
  captionStyle: CaptionStyleId;
  captionFont: CaptionFontId;
  resolution: ResolutionId;
  platform: PlatformId;
  startSeconds: number;
  endSeconds: number;
  viralityScore: number;
  hashtags: string;
  description: string;
  reason: string;
  kind: ClipKind;
  thumbnailUrl: string;
  status: string;
  variants: string[];
  createdAt: string;
};

export type ProjectDTO = {
  id: string;
  title: string;
  sourceType: string;
  sourceUrl: string | null;
  sourcePlatform: string;
  originalFilename: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  status: string;
  vibe: VibeId;
  targetPlatforms: PlatformId[];
  clipLength: ClipLengthId;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

function scoreFor(kind: ClipKind, index: number) {
  const base: Record<ClipKind, number> = {
    hook: 93,
    turn: 84,
    climax: 91,
    payoff: 88,
    cta: 81,
  };
  return clamp(base[kind] - (index % 3) * 2 + (index % 2), 72, 98);
}

export function planWindows(duration: number, clipLength: ClipLengthId): PlannedWindow[] {
  if (duration <= 0.8) {
    return [{ start: 0, end: duration, kind: "hook", score: 90 }];
  }

  const autoLen =
    duration <= 16 ? duration : duration <= 28 ? 12 : duration <= 50 ? 15 : duration <= 90 ? 21 : 30;
  const wanted = clipLength === "auto" ? autoLen : Number(clipLength);
  const length = clamp(wanted, 6, Math.max(6, duration));

  if (duration <= length + 1.2) {
    return [{ start: 0, end: Number(duration.toFixed(3)), kind: "hook", score: 94 }];
  }

  const lastStart = Math.max(0, duration - length);
  const candidates: PlannedWindow[] = [
    { start: 0, end: length, kind: "hook", score: 0 },
    { start: clamp(duration * 0.22, 0, lastStart), end: 0, kind: "turn", score: 0 },
    { start: clamp(duration * 0.42, 0, lastStart), end: 0, kind: "climax", score: 0 },
    { start: clamp(duration * 0.62, 0, lastStart), end: 0, kind: "payoff", score: 0 },
    { start: lastStart, end: duration, kind: "cta", score: 0 },
  ];

  const windows = candidates.map((item, index) => {
    const start = Number(item.start.toFixed(3));
    const end = Number(Math.min(duration, item.kind === "cta" ? duration : start + length).toFixed(3));
    return { start, end, kind: item.kind, score: scoreFor(item.kind, index) };
  });

  const unique: PlannedWindow[] = [];
  for (const window of windows) {
    if (window.end - window.start < 5) continue;
    const tooClose = unique.some((item) => Math.abs(item.start - window.start) < Math.max(3, length * 0.35));
    if (!tooClose) unique.push(window);
  }

  if (unique.length === 0) unique.push(windows[0]);
  return unique.slice(0, 6);
}

export function toProjectDTO(project: Project, extra?: { videoUrl?: string; thumbnailUrl?: string }): ProjectDTO {
  const platforms = project.targetPlatforms
    .split(",")
    .map((item) => item.trim())
    .filter(isPlatform);
  return {
    id: project.id,
    title: project.title,
    sourceType: project.sourceType,
    sourceUrl: project.sourceUrl,
    sourcePlatform: project.sourcePlatform,
    originalFilename: project.originalFilename,
    videoUrl: extra?.videoUrl ?? (project.videoPath ? `/api/media?p=${encodeURIComponent(project.videoPath)}` : ""),
    thumbnailUrl: extra?.thumbnailUrl ?? (project.thumbnailPath ? `/api/media?p=${encodeURIComponent(project.thumbnailPath)}` : ""),
    durationSeconds: project.durationSeconds,
    width: project.width,
    height: project.height,
    status: project.status,
    vibe: isVibe(project.vibe) ? project.vibe : "hype",
    targetPlatforms: platforms.length ? platforms : ["tiktok", "youtube", "facebook"],
    clipLength: isClipLength(project.clipLength) ? project.clipLength : "auto",
    errorMessage: project.errorMessage,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function toClipDTO(clip: Clip): ClipDTO {
  return {
    id: clip.id,
    projectId: clip.projectId,
    title: clip.title,
    hook: clip.hook,
    caption: clip.caption,
    captionStyle: isCaptionStyle(clip.captionStyle) ? clip.captionStyle : "impact",
    captionFont: isCaptionFont(clip.captionFont) ? clip.captionFont : "dejavu",
    resolution: isResolution(clip.resolution) ? clip.resolution : "1080",
    platform: isPlatform(clip.platform) ? clip.platform : "tiktok",
    startSeconds: clip.startSeconds,
    endSeconds: clip.endSeconds,
    viralityScore: clip.viralityScore,
    hashtags: clip.hashtags,
    description: clip.description,
    reason: clip.reason,
    kind: (["hook", "turn", "climax", "payoff", "cta"] as ClipKind[]).includes(clip.kind as ClipKind)
      ? (clip.kind as ClipKind)
      : "hook",
    thumbnailUrl: clip.thumbnailPath ? `/api/media?p=${encodeURIComponent(clip.thumbnailPath)}` : "",
    status: clip.status,
    variants: parseJsonArray(clip.variantsJson),
    createdAt: clip.createdAt.toISOString(),
  };
}

export async function ingestSourceFile(project: Project, absPath: string) {
  const info = await probeVideo(absPath);
  await ensureProjectDirs(project.id);
  const thumbAbs = mediaAbs("projects", project.id, "thumb.jpg");
  const stamp = clamp(info.duration * 0.12, 0.2, Math.max(0.2, info.duration - 0.2));
  await takeScreenshot(absPath, thumbAbs, stamp);
  const videoPath = toRelPath(absPath);
  const thumbnailPath = toRelPath(thumbAbs);
  const [updated] = await db
    .update(projects)
    .set({
      videoPath,
      thumbnailPath,
      durationSeconds: info.duration,
      width: info.width,
      height: info.height,
      status: "ready",
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id))
    .returning();
  return { project: updated ?? project, info };
}

export async function generateClipsForProject(project: Project, selectedWindows?: PlannedWindow[]) {
  if (!project.videoPath) {
    throw new Error("This project still needs a video file before clips can be cut.");
  }
  const abs = fromRelPath(project.videoPath);
  if (!(await fileExists(abs))) {
    throw new Error("The source video is missing. Upload it again.");
  }
  await ensureProjectDirs(project.id);
  const duration = project.durationSeconds || (await probeVideo(abs)).duration;
  const windows = selectedWindows ?? planWindows(duration, isClipLength(project.clipLength) ? project.clipLength : "auto");
  const platforms = project.targetPlatforms.split(",").map((item) => item.trim()).filter(isPlatform);
  const vibe = isVibe(project.vibe) ? project.vibe : "hype";

  await db.delete(clips).where(eq(clips.projectId, project.id));

  const created: Clip[] = [];
  for (const [index, window] of windows.entries()) {
    const platform = platforms[index % Math.max(platforms.length, 1)] ?? "tiktok";
    const pack = buildCaptionPack({
      vibe,
      platform,
      kind: window.kind,
      index,
      sourceTitle: project.title,
    });
    const clipId = crypto.randomUUID();
    const thumbAbs = mediaAbs("projects", project.id, "clips", `${clipId}.jpg`);
    const stamp = clamp(window.start + Math.min(1.2, (window.end - window.start) * 0.25), 0.05, Math.max(0.1, duration - 0.05));
    try {
      await takeScreenshot(abs, thumbAbs, stamp);
    } catch {
      // preview can fall back to the project thumbnail
    }
    const [row] = await db
      .insert(clips)
      .values({
        id: clipId,
        projectId: project.id,
        title: pack.title,
        hook: pack.hook,
        caption: pack.caption,
        captionStyle: pack.style,
        platform,
        startSeconds: window.start,
        endSeconds: window.end,
        viralityScore: window.score,
        hashtags: pack.hashtags,
        description: pack.description,
        reason: pack.reason,
        kind: window.kind,
        thumbnailPath: (await fileExists(thumbAbs)) ? toRelPath(thumbAbs) : project.thumbnailPath,
        variantsJson: JSON.stringify(pack.variants),
        status: "ready",
      })
      .returning();
    if (row) created.push(row);
  }

  await db
    .update(projects)
    .set({ status: "ready", updatedAt: new Date(), errorMessage: null })
    .where(eq(projects.id, project.id));

  return created;
}

export async function createCustomClip(project: Project, startSeconds: number, endSeconds: number) {
  if (!project.videoPath) throw new Error("This project still needs a source video.");
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
    throw new Error("Enter valid start and end times.");
  }
  const duration = project.durationSeconds;
  const start = Number(clamp(startSeconds, 0, duration).toFixed(3));
  const end = Number(clamp(endSeconds, 0, duration).toFixed(3));
  if (end - start < 1 || end - start > 180) {
    throw new Error("Choose a clip between 1 second and 3 minutes.");
  }

  const input = fromRelPath(project.videoPath);
  if (!(await fileExists(input))) throw new Error("The source video is missing. Upload it again.");
  await ensureProjectDirs(project.id);
  const existing = await db.select().from(clips).where(eq(clips.projectId, project.id));
  const platforms = project.targetPlatforms.split(",").map((item) => item.trim()).filter(isPlatform);
  const platform = platforms[0] ?? "tiktok";
  const vibe = isVibe(project.vibe) ? project.vibe : "hype";
  const pack = buildCaptionPack({
    vibe,
    platform,
    kind: "hook",
    index: existing.length,
    sourceTitle: project.title,
  });
  const id = crypto.randomUUID();
  const thumbAbs = mediaAbs("projects", project.id, "clips", `${id}.jpg`);
  const stamp = clamp(start + Math.min(1.2, (end - start) * 0.25), 0.05, Math.max(0.1, duration - 0.05));
  try {
    await takeScreenshot(input, thumbAbs, stamp);
  } catch {
    // The project thumbnail remains available if a frame cannot be extracted.
  }
  const [clip] = await db
    .insert(clips)
    .values({
      id,
      projectId: project.id,
      title: "Custom cut",
      hook: pack.hook,
      caption: pack.caption,
      captionStyle: pack.style,
      captionFont: "dejavu",
      resolution: "source",
      platform,
      startSeconds: start,
      endSeconds: end,
      viralityScore: 0,
      hashtags: pack.hashtags,
      description: pack.description,
      reason: "Manually selected from the full source video.",
      kind: "hook",
      thumbnailPath: (await fileExists(thumbAbs)) ? toRelPath(thumbAbs) : project.thumbnailPath,
      variantsJson: JSON.stringify(pack.variants),
      status: "ready",
    })
    .returning();
  if (!clip) throw new Error("Could not save this custom clip.");
  return clip;
}

export async function getProjectBundle(id: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return null;
  const rows = await db.select().from(clips).where(eq(clips.projectId, id));
  rows.sort((a, b) => a.startSeconds - b.startSeconds);
  return { project, clips: rows };
}

export async function requireClip(id: string) {
  const [clip] = await db.select().from(clips).where(eq(clips.id, id)).limit(1);
  if (!clip) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, clip.projectId)).limit(1);
  if (!project) return null;
  return { clip, project };
}

export async function updateClipFields(
  id: string,
  patch: Partial<
    Pick<
      Clip,
      | "caption"
      | "hook"
      | "captionStyle"
      | "captionFont"
      | "resolution"
      | "platform"
      | "hashtags"
      | "description"
      | "title"
      | "startSeconds"
      | "endSeconds"
    >
  >,
) {
  const [updated] = await db
    .update(clips)
    .set(patch)
    .where(and(eq(clips.id, id)))
    .returning();
  return updated;
}
