import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { createCustomClip, toClipDTO } from "@/lib/clip-engine";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Project not found.", 404);
  if (!project.videoPath) return jsonError("Upload the source video first.", 400);

  try {
    const body = (await request.json()) as { startSeconds?: number; endSeconds?: number };
    if (typeof body.startSeconds !== "number" || typeof body.endSeconds !== "number") {
      return jsonError("Enter valid start and end times.", 400);
    }
    const clip = await createCustomClip(project, body.startSeconds, body.endSeconds);
    return jsonOk({ clip: toClipDTO(clip) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save this custom clip.";
    return jsonError(message, 400);
  }
}
