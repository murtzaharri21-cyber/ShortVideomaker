import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getProjectBundle, toClipDTO, toProjectDTO } from "@/lib/clip-engine";
import { jsonError, jsonOk } from "@/lib/http";
import { removeProjectFiles } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return jsonError("Project not found.", 404);
  return jsonOk({
    project: toProjectDTO(bundle.project),
    clips: bundle.clips.map(toClipDTO),
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json()) as { title?: string };
  const title = body.title?.trim().slice(0, 80);
  if (!title) return jsonError("Title is required.");
  const [updated] = await db
    .update(projects)
    .set({ title, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  if (!updated) return jsonError("Project not found.", 404);
  return jsonOk({ project: toProjectDTO(updated) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [existing] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!existing) return jsonError("Project not found.", 404);
  await db.delete(projects).where(eq(projects.id, id));
  await removeProjectFiles(id);
  return jsonOk({ ok: true });
}
