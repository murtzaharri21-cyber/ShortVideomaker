import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { fromRelPath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
  ".mkv": "video/x-matroska",
  ".avi": "video/x-msvideo",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rel = url.searchParams.get("p") || "";
  if (!rel) return new Response("Not found", { status: 404 });

  let abs: string;
  try {
    abs = fromRelPath(rel);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  let fileStat;
  try {
    fileStat = await stat(abs);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const type = TYPES[path.extname(abs).toLowerCase()] || "application/octet-stream";
  const size = fileStat.size;
  const range = request.headers.get("range");

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (!match) return new Response("Invalid range", { status: 416 });
    const start = match[1] ? Number(match[1]) : 0;
    const end = Math.min(match[2] ? Number(match[2]) : size - 1, size - 1);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
      return new Response("Invalid range", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const stream = createReadStream(abs, { start, end });
    return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": type,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  const stream = createReadStream(abs);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
