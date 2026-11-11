import { lt } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { BUSINESS } from "@/lib/business";
import { removeProjectFiles } from "@/lib/storage";

let lastRun = 0;

/** Deletes projects (and their files) older than the retention window. Runs at most hourly. */
export async function purgeExpiredProjects() {
  if (Date.now() - lastRun < 60 * 60 * 1000) return 0;
  lastRun = Date.now();
  const cutoff = new Date(Date.now() - BUSINESS.retentionDays * 864e5);
  const expired = await db.delete(projects).where(lt(projects.createdAt, cutoff)).returning({ id: projects.id });
  await Promise.all(expired.map((row) => removeProjectFiles(row.id)));
  return expired.length;
}
