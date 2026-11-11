import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";

export const MEDIA_ROOT = path.join(process.cwd(), "data", "media");

export function mediaAbs(...parts: string[]) {
  return path.join(MEDIA_ROOT, ...parts);
}

export function toRelPath(absPath: string) {
  const relative = path.relative(MEDIA_ROOT, absPath).replaceAll("\\", "/");
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid media path");
  }
  return relative;
}

export function fromRelPath(relPath: string) {
  const normalized = path.normalize(relPath).replaceAll("\\", "/");
  if (normalized.startsWith("..") || path.isAbsolute(normalized) || normalized.includes("\0")) {
    throw new Error("Invalid media path");
  }
  const abs = path.join(MEDIA_ROOT, normalized);
  const relative = path.relative(MEDIA_ROOT, abs);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid media path");
  }
  return abs;
}

export function mediaUrl(relPath: string | null | undefined) {
  if (!relPath) return "";
  return `/api/media?p=${encodeURIComponent(relPath)}`;
}

export async function ensureDir(absPath: string) {
  await mkdir(absPath, { recursive: true });
}

export async function ensureProjectDirs(projectId: string) {
  await ensureDir(mediaAbs("projects", projectId, "clips"));
}

export async function removeProjectFiles(projectId: string) {
  await rm(mediaAbs("projects", projectId), { recursive: true, force: true });
}

export async function fileExists(absPath: string) {
  try {
    await stat(absPath);
    return true;
  } catch {
    return false;
  }
}
