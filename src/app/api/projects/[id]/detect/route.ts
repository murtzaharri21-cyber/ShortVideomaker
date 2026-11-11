import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { toClipDTO, toProjectDTO } from "@/lib/clip-engine";
import { createClipsFromFrames, detectViralFrames } from "@/lib/frame-detector";
import { isClipLength, isPlatform, isVibe } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Project not found.", 404);
  if (!project.videoPath) return jsonError("Upload the source video first.", 400);

  try {
    const body = (await request.json().catch(() => ({}))) as {
      clipLength?: string;
      vibe?: string;
      platforms?: string[];
      sampleCount?: number;
    };

    const clipLength = body.clipLength && isClipLength(body.clipLength) ? body.clipLength : project.clipLength;
    const detection = await detectViralFrames({
      projectId: id,
      sampleCount: body.sampleCount ?? 16,
      clipLength: clipLength === "auto" ? 15 : Number(clipLength),
    });

    const vibe = body.vibe && isVibe(body.vibe) ? body.vibe : project.vibe;
    const platforms = Array.isArray(body.platforms)
      ? body.platforms.filter(isPlatform)
      : project.targetPlatforms.split(",").filter(isPlatform);

    const rows = await createClipsFromFrames({
      projectId: id,
      frames: detection.frames,
      clipLength: clipLength === "auto" ? "15" : clipLength,
      vibe,
      platforms,
    });

    const [fresh] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return jsonOk({
      project: toProjectDTO(fresh ?? project),
      clips: rows.map(toClipDTO),
      frames: detection.frames,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not detect viral frames.";
    await db
      .update(projects)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(projects.id, id));
    return jsonError(message, 500);
  }
}
