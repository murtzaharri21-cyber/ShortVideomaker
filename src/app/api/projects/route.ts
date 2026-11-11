import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clips, projects } from "@/db/schema";
import { toClipDTO, toProjectDTO } from "@/lib/clip-engine";
import {
  isClipLength,
  isPlatform,
  isVibe,
  type ClipLengthId,
  type PlatformId,
  type VibeId,
} from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/http";
import { createProjectRecord, finishWithClips, importLinkedVideo, saveUploadedFile } from "@/lib/ingest";
import { normalizeVideoUrl } from "@/lib/platforms";
import { mediaUrl } from "@/lib/storage";
import { purgeExpiredProjects } from "@/lib/retention";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 1800;

function parseOptions(form: FormData) {
  const vibeRaw = String(form.get("vibe") || "hype");
  const lengthRaw = String(form.get("clipLength") || "auto");
  const platformsRaw = String(form.get("platforms") || "tiktok,youtube,facebook");
  const vibe: VibeId = isVibe(vibeRaw) ? vibeRaw : "hype";
  const clipLength: ClipLengthId = isClipLength(lengthRaw) ? lengthRaw : "auto";
  const platforms = platformsRaw
    .split(",")
    .map((item) => item.trim())
    .filter(isPlatform);
  return {
    title: String(form.get("title") || "").trim(),
    vibe,
    clipLength,
    platforms: (platforms.length ? platforms : ["tiktok", "youtube", "facebook"]) as PlatformId[],
  };
}

export async function GET() {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  const allClips = await db.select().from(clips);
  const payload = rows.map((project) => {
    const related = allClips.filter((clip) => clip.projectId === project.id);
    return {
      ...toProjectDTO(project, {
        videoUrl: mediaUrl(project.videoPath),
        thumbnailUrl: mediaUrl(project.thumbnailPath),
      }),
      clipCount: related.length,
    };
  });
  return jsonOk({ projects: payload });
}

export async function POST(request: Request) {
  try {
    await purgeExpiredProjects().catch(() => 0);
    const form = await request.formData();
    if (form.get("consent") !== "1") {
      return jsonError("Please confirm your age and that you have rights to this video.");
    }
    const options = parseOptions(form);
    const file = form.get("file");
    const url = normalizeVideoUrl(String(form.get("url") || ""));
    const upload = file instanceof File && file.size > 0 ? file : null;

    if (!upload && !url) {
      return jsonError("Upload a video or paste a link.");
    }

    const project = await createProjectRecord({
      ...options,
      sourceType: upload ? "upload" : "url",
      sourceUrl: url || undefined,
      file: upload,
    });

    try {
      if (upload) {
        const saved = await saveUploadedFile(project, upload);
        const finished = await finishWithClips(saved.project, saved.dest);
        return jsonOk({
          project: toProjectDTO(finished.project),
          clips: finished.clips.map(toClipDTO),
        });
      }

      const finished = await importLinkedVideo(project, url);
      return jsonOk({
        project: toProjectDTO(finished.project),
        clips: finished.clips.map(toClipDTO),
        warning: finished.warning,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import that video.";
      await db
        .update(projects)
        .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
        .where(eq(projects.id, project.id));
      return jsonError(message, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create project.";
    return jsonError(message, 500);
  }
}
