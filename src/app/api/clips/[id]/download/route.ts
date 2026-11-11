import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clips } from "@/db/schema";
import { requireClip } from "@/lib/clip-engine";
import { fontById, isCaptionStyle, resolutionById } from "@/lib/constants";
import {
  exportCaptionedShort,
  exportOriginalClip,
  fontFileExists,
  probeVideo,
  renderKey,
  tempAssPath,
  writeCaptionAss,
} from "@/lib/ffmpeg";
import { jsonError } from "@/lib/http";
import { ensureDir, fileExists, fromRelPath, mediaAbs, toRelPath } from "@/lib/storage";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

function downloadName(title: string, platform: string, mode: string, resolution: string) {
  return `voltcut-${slugify(title)}-${platform}-${mode}-${resolution}.mp4`;
}

async function fileResponse(abs: string, filename: string) {
  const fileStat = await stat(abs);
  const stream = createReadStream(abs);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = await requireClip(id);
  if (!bundle) return jsonError("Clip not found.", 404);
  if (!bundle.project.videoPath) return jsonError("This project still needs a source video.", 400);

  const params = new URL(request.url).searchParams;
  const mode = params.get("mode") === "original" ? "original" : "captioned";
  const resolutionId = params.get("resolution") || (mode === "original" ? "source" : bundle.clip.resolution || "1080");
  const resolution = resolutionById(resolutionId);
  const fontId = params.get("font") || bundle.clip.captionFont || "dejavu";
  const font = fontById(fontId);

  const start = bundle.clip.startSeconds;
  const duration = Math.max(0.4, bundle.clip.endSeconds - bundle.clip.startSeconds);
  const vertical = resolution.id !== "source";
  const width = resolution.width || bundle.project.width || 1080;
  const height = resolution.height || bundle.project.height || 1920;

  try {
    const input = fromRelPath(bundle.project.videoPath);
    const info = await probeVideo(input);
    await ensureDir(mediaAbs("projects", bundle.project.id, "clips"));

    if (mode === "original") {
      const dest = mediaAbs(
        "projects",
        bundle.project.id,
        "clips",
        `${bundle.clip.id}-original-${resolution.id}.mp4`,
      );
      if (!(await fileExists(dest))) {
        await exportOriginalClip({
          input,
          output: dest,
          start,
          duration,
          hasAudio: info.hasAudio,
          width: vertical ? width : undefined,
          height: vertical ? height : undefined,
          vertical,
        });
        await db
          .update(clips)
          .set({ originalPath: toRelPath(dest) })
          .where(eq(clips.id, bundle.clip.id));
      }
      return fileResponse(dest, downloadName(bundle.clip.title, bundle.clip.platform, "hq", resolution.id));
    }

    const style = isCaptionStyle(bundle.clip.captionStyle) ? bundle.clip.captionStyle : "impact";
    const useFont = fontFileExists(font.file) ? font : fontById("dejavu");
    const key = renderKey({
      caption: bundle.clip.caption,
      hook: bundle.clip.hook,
      style,
      font: useFont.id,
      resolution: resolution.id,
      start: bundle.clip.startSeconds,
      end: bundle.clip.endSeconds,
    });
    const dest = mediaAbs(
      "projects",
      bundle.project.id,
      "clips",
      `${bundle.clip.id}-captioned-${resolution.id}-${useFont.id}.mp4`,
    );
    if (!(await fileExists(dest)) || bundle.clip.renderKey !== key) {
      const assPath = tempAssPath(dest);
      await writeCaptionAss({
        filePath: assPath,
        hook: bundle.clip.hook,
        caption: bundle.clip.caption,
        duration,
        style,
        fontFamily: useFont.family,
        fontFile: useFont.file,
        playResX: vertical ? width : bundle.project.width || width,
        playResY: vertical ? height : bundle.project.height || height,
      });
      await exportCaptionedShort({
        input,
        output: dest,
        assPath,
        start,
        duration,
        hasAudio: info.hasAudio,
        width,
        height,
        vertical,
      });
      await db
        .update(clips)
        .set({ renderedPath: toRelPath(dest), renderKey: key, status: "ready" })
        .where(eq(clips.id, bundle.clip.id));
    }

    return fileResponse(dest, downloadName(bundle.clip.title, bundle.clip.platform, "9x16", resolution.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not export that clip.";
    return jsonError(message, 500);
  }
}
