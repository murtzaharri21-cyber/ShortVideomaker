import { notFound } from "next/navigation";
import { ClipEditor } from "@/components/clip-editor";
import { requireClip, toClipDTO, toProjectDTO } from "@/lib/clip-engine";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; clipId: string }>;
}) {
  const { clipId } = await params;
  const bundle = await requireClip(clipId);
  return { title: bundle ? `${bundle.clip.title} — VoltCut` : "Clip — VoltCut" };
}

export default async function ClipPage({
  params,
}: {
  params: Promise<{ id: string; clipId: string }>;
}) {
  const { id, clipId } = await params;
  const bundle = await requireClip(clipId);
  if (!bundle || bundle.project.id !== id) notFound();
  return <ClipEditor project={toProjectDTO(bundle.project)} clip={toClipDTO(bundle.clip)} />;
}
