import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { jsonError } from "@/lib/http";
import { fileExists, fromRelPath } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  avi: "video/x-msvideo",
  m4v: "video/x-m4v",
  mkv: "video/x-matroska",
  mov: "video/quicktime",
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return jsonError("Project not found.", 404);
  if (!project.videoPath) return jsonError("This project does not have a source video.", 404);

  const source = fromRelPath(project.videoPath);
  if (!(await fileExists(source))) return jsonError("The source video is missing. Upload it again.", 404);

  const info = await stat(source);
  const extension = path.extname(source).slice(1).toLowerCase() || "mp4";
  const filename = `voltcut-${slugify(project.title)}-full-video.${extension}`;
  const stream = createReadStream(source);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
      "Content-Length": String(info.size),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
