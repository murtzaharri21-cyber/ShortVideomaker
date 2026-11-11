import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { generateClipsForProject, toClipDTO, toProjectDTO } from "@/lib/clip-engine";
import { isClipLength, isPlatform, isVibe } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Project not found.", 404);
  if (!project.videoPath) {
    return jsonError("Upload the source video first.", 400);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      vibe?: string;
      clipLength?: string;
      platforms?: string[];
    };
    const vibe = body.vibe && isVibe(body.vibe) ? body.vibe : project.vibe;
    const clipLength = body.clipLength && isClipLength(body.clipLength) ? body.clipLength : project.clipLength;
    const platforms = Array.isArray(body.platforms)
      ? body.platforms.filter(isPlatform)
      : project.targetPlatforms.split(",").filter(isPlatform);

    const [updated] = await db
      .update(projects)
      .set({
        vibe,
        clipLength,
        targetPlatforms: (platforms.length ? platforms : ["tiktok"]).join(","),
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    const rows = await generateClipsForProject(updated ?? project);
    const [fresh] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return jsonOk({
      project: toProjectDTO(fresh ?? updated ?? project),
      clips: rows.map(toClipDTO),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate clips.";
    await db
      .update(projects)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(projects.id, id));
    return jsonError(message, 500);
  }
}
