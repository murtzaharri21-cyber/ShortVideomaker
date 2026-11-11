import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { toClipDTO, toProjectDTO } from "@/lib/clip-engine";
import { jsonError, jsonOk } from "@/lib/http";
import { copyDemoVideo, finishWithClips, importLinkedVideo, saveUploadedFile } from "@/lib/ingest";
import { normalizeVideoUrl } from "@/lib/platforms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 1800;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Project not found.", 404);

  try {
    const form = await request.formData();
    const sample = String(form.get("sample") || "") === "1";
    const url = normalizeVideoUrl(String(form.get("url") || ""));
    const file = form.get("file");

    if (sample) {
      const copied = await copyDemoVideo(project);
      const finished = await finishWithClips(copied.project, copied.dest);
      return jsonOk({
        project: toProjectDTO(finished.project),
        clips: finished.clips.map(toClipDTO),
      });
    }

    if (url) {
      const finished = await importLinkedVideo(project, url);
      return jsonOk({
        project: toProjectDTO(finished.project),
        clips: finished.clips.map(toClipDTO),
        warning: finished.warning,
      });
    }

    if (!(file instanceof File) || file.size <= 0) {
      return jsonError("Drop a video file to continue.");
    }
    const saved = await saveUploadedFile(project, file);
    const finished = await finishWithClips(saved.project, saved.dest);
    return jsonOk({
      project: toProjectDTO(finished.project),
      clips: finished.clips.map(toClipDTO),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not attach that video.";
    await db
      .update(projects)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(projects.id, id));
    return jsonError(message, 400);
  }
}
