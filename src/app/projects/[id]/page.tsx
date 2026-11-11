import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/project-workspace";
import { getProjectBundle, toClipDTO, toProjectDTO } from "@/lib/clip-engine";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  return { title: bundle ? `${bundle.project.title} — VoltCut` : "Project — VoltCut" };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  if (!bundle) notFound();
  return <ProjectWorkspace project={toProjectDTO(bundle.project)} clips={bundle.clips.map(toClipDTO)} />;
}
