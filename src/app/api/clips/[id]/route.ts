import { isCaptionFont, isCaptionStyle, isPlatform, isResolution } from "@/lib/constants";
import { requireClip, toClipDTO, updateClipFields } from "@/lib/clip-engine";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = await requireClip(id);
  if (!bundle) return jsonError("Clip not found.", 404);
  return jsonOk({ clip: toClipDTO(bundle.clip) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const bundle = await requireClip(id);
  if (!bundle) return jsonError("Clip not found.", 404);

  const body = (await request.json()) as {
    title?: string;
    hook?: string;
    caption?: string;
    captionStyle?: string;
    captionFont?: string;
    resolution?: string;
    platform?: string;
    hashtags?: string;
    description?: string;
    startSeconds?: number;
    endSeconds?: number;
  };

  const patch: Parameters<typeof updateClipFields>[1] = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim().slice(0, 80);
  if (typeof body.hook === "string") patch.hook = body.hook.trim().slice(0, 140);
  if (typeof body.caption === "string") patch.caption = body.caption.trim().slice(0, 220);
  if (typeof body.hashtags === "string") patch.hashtags = body.hashtags.trim().slice(0, 220);
  if (typeof body.description === "string") patch.description = body.description.trim().slice(0, 500);
  if (body.captionStyle && isCaptionStyle(body.captionStyle)) patch.captionStyle = body.captionStyle;
  if (body.captionFont && isCaptionFont(body.captionFont)) patch.captionFont = body.captionFont;
  if (body.resolution && isResolution(body.resolution)) patch.resolution = body.resolution;
  if (body.platform && isPlatform(body.platform)) patch.platform = body.platform;

  if (typeof body.startSeconds === "number" && Number.isFinite(body.startSeconds)) {
    patch.startSeconds = Math.max(0, body.startSeconds);
  }
  if (typeof body.endSeconds === "number" && Number.isFinite(body.endSeconds)) {
    patch.endSeconds = Math.max(patch.startSeconds ?? bundle.clip.startSeconds + 0.5, body.endSeconds);
  }

  const updated = await updateClipFields(id, patch);
  if (!updated) return jsonError("Clip not found.", 404);
  return jsonOk({ clip: toClipDTO(updated) });
}
