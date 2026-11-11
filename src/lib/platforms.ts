import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ALLOWED_VIDEO_EXT } from "@/lib/constants";
import { extensionOf } from "@/lib/utils";

export type DetectedSource = {
  platform: "youtube" | "tiktok" | "facebook" | "instagram" | "file" | "web";
  kind: "direct" | "social";
  url: string;
  id?: string;
};

const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function normalizeVideoUrl(raw: string) {
  let trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed.replace(/^\/\//, "")}`;
  }
  return trimmed;
}

export function detectSource(raw: string): DetectedSource | null {
  const trimmed = normalizeVideoUrl(raw);
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname;

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
    const id =
      host === "youtu.be"
        ? path.replace("/", "").split("/")[0]
        : url.searchParams.get("v") || path.split("/").filter(Boolean).at(-1);
    return { platform: "youtube", kind: "social", url: trimmed, id: id || undefined };
  }
  if (host.endsWith("tiktok.com")) {
    return { platform: "tiktok", kind: "social", url: trimmed };
  }
  if (host.endsWith("facebook.com") || host === "fb.watch" || host.endsWith("fb.com")) {
    return { platform: "facebook", kind: "social", url: trimmed };
  }
  if (host.endsWith("instagram.com") || host === "instagr.am") {
    return { platform: "instagram", kind: "social", url: trimmed };
  }
  if (
    host === "x.com" ||
    host === "twitter.com" ||
    host === "t.co" ||
    host.endsWith("vimeo.com") ||
    host.endsWith("dailymotion.com") ||
    host.endsWith("reddit.com") ||
    host === "v.redd.it" ||
    host.endsWith("twitch.tv") ||
    host.endsWith("threads.net") ||
    host.endsWith("snapchat.com") ||
    host.endsWith("pinterest.com") ||
    host.endsWith("rumble.com") ||
    host.endsWith("bilibili.com")
  ) {
    return { platform: "web", kind: "social", url: trimmed };
  }

  const ext = extensionOf(path);
  if ((ALLOWED_VIDEO_EXT as readonly string[]).includes(ext)) {
    return { platform: "file", kind: "direct", url: trimmed };
  }
  return { platform: "web", kind: "direct", url: trimmed };
}

function isPrivateIp(ip: string) {
  if (PRIVATE_HOSTS.has(ip)) return true;
  if (ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) {
    return true;
  }
  if (ip.startsWith("0.")) return true;
  const match = /^172\.(\d+)\./.exec(ip);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

export async function assertPublicUrl(raw: string) {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("That URL points at a private host.");
  }
  const ip = isIP(host) ? host : (await lookup(host)).address;
  if (isPrivateIp(ip)) {
    throw new Error("That URL resolves to a private network.");
  }
}

export async function fetchOEmbed(source: DetectedSource) {
  const endpoint =
    source.platform === "youtube"
      ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(source.url)}`
      : source.platform === "tiktok"
        ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(source.url)}`
        : null;
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title?.trim() || null,
      author: data.author_name?.trim() || null,
      thumbnail: data.thumbnail_url || null,
    };
  } catch {
    return null;
  }
}

export function platformLabel(platform: string) {
  switch (platform) {
    case "youtube":
      return "YouTube";
    case "tiktok":
      return "TikTok";
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "file":
      return "File";
    default:
      return "Web";
  }
}
