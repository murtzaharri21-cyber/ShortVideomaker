import { eq } from "drizzle-orm";
import { db } from "@/db";
import { deletionRequests, projects } from "@/db/schema";
import { jsonError, jsonOk } from "@/lib/http";
import { removeProjectFiles } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; projects?: string; details?: string; confirm?: boolean };
  if (!body.confirm) return jsonError("Please confirm the request.");
  const email = body.email?.trim().slice(0, 200) || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("That email address doesn't look valid.");
  const ids = Array.from(new Set((body.projects || "").match(UUID) ?? [])).slice(0, 50);
  const details = (body.details || "").trim().slice(0, 2000);
  if (!ids.length && !details) return jsonError("Add at least one project link or describe what to delete.");

  let deleted = 0;
  for (const id of ids) {
    const rows = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    if (rows.length) {
      deleted += 1;
      await removeProjectFiles(id);
    }
  }

  const [row] = await db
    .insert(deletionRequests)
    .values({
      email,
      projectIds: ids.join(","),
      details,
      deletedCount: deleted,
      status: ids.length && !details ? "completed" : "received",
    })
    .returning({ id: deletionRequests.id, status: deletionRequests.status });

  return jsonOk({ reference: row?.id, status: row?.status, deleted, requested: ids.length });
}
