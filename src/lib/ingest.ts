import { copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, type Project } from "@/db/schema";
import { generateClipsForProject, ingestSourceFile } from "@/lib/clip-engine";
import { ALLOWED_VIDEO_EXT, MAX_UPLOAD_BYTES, type ClipLengthId, type PlatformId, type VibeId } from "@/lib/constants";
import { assertPublicUrl, detectSource, fetchOEmbed } from "@/lib/platforms";
import { downloadVideoFromUrl } from "@/lib/social-download";
import { ensureProjectDirs, mediaAbs } from "@/lib/storage";
import { extensionOf } from "@/lib/utils";

export type CreateInput = {
  title?: string;
  vibe: VibeId;
  clipLength: ClipLengthId;
  platforms: PlatformId[];
  sourceType: "upload" | "url" | "demo";
  sourceUrl?: string;
  file?: File | null;
};

function cleanTitle(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 80) : fallback;
}

export async function createProjectRecord(input: CreateInput) {
  const title = cleanTitle(input.title, input.sourceType === "demo" ? "VoltCut demo cut" : "Untitled cut");
  const [project] = await db
    .insert(projects)
    .values({
      title,
      sourceType: input.sourceType,
      sourceUrl: input.sourceUrl ?? null,
      sourcePlatform: "file",
      vibe: input.vibe,
      clipLength: input.clipLength,
      targetPlatforms: input.platforms.join(","),
      status: "processing",
    })
    .returning();
  if (!project) throw new Error("Could not create project");
  await ensureProjectDirs(project.id);
  return project;
}

function extensionFromUpload(file: File) {
  const fromName = extensionOf(file.name || "");
  if ((ALLOWED_VIDEO_EXT as readonly string[]).includes(fromName)) return fromName;
  const mime = file.type.toLowerCase();
  if (mime.includes("webm")) return "webm";
  if (mime.includes("quicktime")) return "mov";
  if (mime.includes("matroska")) return "mkv";
  if (mime.includes("mp4") || mime.includes("mpeg") || mime.startsWith("video/")) return "mp4";
  return "";
}

export async function saveUploadedFile(project: Project, file: File) {
  const ext = extensionFromUpload(file) || "mp4";
  if (!(ALLOWED_VIDEO_EXT as readonly string[]).includes(ext)) {
    throw new Error("Use MP4, MOV, WEBM, M4V, MKV, or AVI.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That file is over 120MB. Compress it or cut it shorter first.");
  }
  const dest = mediaAbs("projects", project.id, `source.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);
  const [updated] = await db
    .update(projects)
    .set({
      originalFilename: file.name || `source.${ext}`,
      sourcePlatform: "file",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id))
    .returning();
  return { project: updated ?? project, dest };
}

export async function importDirectVideoUrl(project: Project, url: string) {
  await assertPublicUrl(url);
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(90_000),
    headers: { "User-Agent": "VoltCut/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Could not download that file (${response.status}).`);
  }
  const length = Number(response.headers.get("content-length") || "0");
  if (length > MAX_UPLOAD_BYTES) {
    throw new Error("That remote file is over 120MB.");
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType && !contentType.includes("video") && !contentType.includes("octet-stream") && !contentType.includes("mp4")) {
    throw new Error("That URL did not look like a video file. Upload the MP4 instead.");
  }
  const urlPath = new URL(url).pathname;
  const ext = extensionOf(urlPath) || "mp4";
  const dest = mediaAbs("projects", project.id, `source.${ext}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("That remote file is over 120MB.");
  }
  await writeFile(dest, buffer);
  const [updated] = await db
    .update(projects)
    .set({
      sourceUrl: url,
      sourcePlatform: "file",
      originalFilename: path.basename(urlPath) || "remote.mp4",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id))
    .returning();
  return { project: updated ?? project, dest };
}

export async function importLinkedVideo(project: Project, url: string) {
  const detected = detectSource(url);
  if (!detected) throw new Error("That link is not a valid http(s) URL.");
  const meta = await fetchOEmbed(detected);
  const title = (meta?.title || project.title || "Untitled cut").slice(0, 80);

  if (meta?.thumbnail) {
    try {
      await assertPublicUrl(meta.thumbnail);
      const image = await fetch(meta.thumbnail, { signal: AbortSignal.timeout(8000) });
      if (image.ok) {
        const thumb = mediaAbs("projects", project.id, "thumb.jpg");
        await writeFile(thumb, Buffer.from(await image.arrayBuffer()));
        await db
          .update(projects)
          .set({ thumbnailPath: `projects/${project.id}/thumb.jpg` })
          .where(eq(projects.id, project.id));
      }
    } catch {
      // thumbnail is optional
    }
  }

  await db
    .update(projects)
    .set({
      title,
      sourceUrl: url,
      sourcePlatform: detected.platform,
      status: "processing",
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id));
  let dest: string | null = null;

  const fetchUrl =
    detected.platform === "youtube" && detected.id
      ? `https://www.youtube.com/watch?v=${detected.id}`
      : detected.url;

  try {
    const downloaded = await downloadVideoFromUrl(fetchUrl, project.id);
    dest = downloaded.path;
  } catch (error) {
    const downloadMessage = error instanceof Error ? error.message : "Could not pull that video.";
    if (detected.kind === "direct") {
      try {
        const saved = await importDirectVideoUrl(project, url);
        dest = saved.dest;
      } catch {
        throw new Error(downloadMessage);
      }
    } else {
      throw new Error(downloadMessage);
    }
  }

  if (!dest) {
    throw new Error("Could not pull that video.");
  }

  const [fresh] = await db.select().from(projects).where(eq(projects.id, project.id)).limit(1);
  const finished = await finishWithClips(fresh ?? project, dest);
  return { ...finished, warning: null };
}

export async function copyDemoVideo(project: Project) {
  const demo = path.join(process.cwd(), "public", "samples", "demo.mp4");
  const dest = mediaAbs("projects", project.id, "source.mp4");
  await copyFile(demo, dest);
  const [updated] = await db
    .update(projects)
    .set({
      sourceType: "demo",
      sourcePlatform: "file",
      originalFilename: "demo.mp4",
      title: project.title || "VoltCut demo cut",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id))
    .returning();
  return { project: updated ?? project, dest };
}

export async function finishWithClips(project: Project, dest: string) {
  const ingested = await ingestSourceFile(project, dest);
  const rows = await generateClipsForProject(ingested.project);
  const [fresh] = await db.select().from(projects).where(eq(projects.id, project.id)).limit(1);
  return { project: fresh ?? ingested.project, clips: rows };
}
