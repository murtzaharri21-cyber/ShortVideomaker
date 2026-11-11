import { toClipDTO, toProjectDTO } from "@/lib/clip-engine";
import { isClipLength, isPlatform, isVibe, type PlatformId } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/http";
import { copyDemoVideo, createProjectRecord, finishWithClips } from "@/lib/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      consent?: boolean;
      vibe?: string;
      clipLength?: string;
      platforms?: string[];
      title?: string;
    };
    const platforms = Array.isArray(body.platforms) ? body.platforms.filter(isPlatform) : [];
    const project = await createProjectRecord({
      title: body.title || "VoltCut demo cut",
      vibe: body.vibe && isVibe(body.vibe) ? body.vibe : "hype",
      clipLength: body.clipLength && isClipLength(body.clipLength) ? body.clipLength : "auto",
      platforms: (platforms.length ? platforms : ["tiktok", "youtube", "facebook"]) as PlatformId[],
      sourceType: "demo",
    });
    const copied = await copyDemoVideo(project);
    const finished = await finishWithClips(copied.project, copied.dest);
    return jsonOk({
      project: toProjectDTO(finished.project),
      clips: finished.clips.map(toClipDTO),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not build the demo project.";
    return jsonError(message, 500);
  }
}
