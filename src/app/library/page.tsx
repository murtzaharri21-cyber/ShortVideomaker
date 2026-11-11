import { desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { purgeExpiredProjects } from "@/lib/retention";
import { clips, projects } from "@/db/schema";
import { toProjectDTO } from "@/lib/clip-engine";
import { mediaUrl } from "@/lib/storage";
import { formatClock } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Library — VoltCut",
};

export default async function LibraryPage() {
  await purgeExpiredProjects().catch(() => 0);
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  const allClips = await db.select().from(clips);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-mist">Library</p>
          <h1 className="mt-3 font-display text-5xl">Cuts</h1>
        </div>
        <Link href="/studio" className="rounded-xl bg-volt text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold">
          New cut
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-3xl">Nothing on the timeline yet.</p>
          <p className="mt-3 text-mist">Run the demo reel or drop a video in the studio.</p>
          <Link href="/studio" className="mt-6 inline-block rounded-xl bg-sand px-5 py-2 font-semibold text-ink">
            Open studio
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => {
            const dto = toProjectDTO(project, {
              videoUrl: mediaUrl(project.videoPath),
              thumbnailUrl: mediaUrl(project.thumbnailPath),
            });
            const count = allClips.filter((clip) => clip.projectId === project.id).length;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="overflow-hidden rounded-2xl border border-line bg-ink-2"
              >
                <div className="relative h-44 bg-ink">
                  {dto.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dto.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image src="/images/editor-dark.jpg" alt="" fill sizes="400px" className="object-cover opacity-40" />
                  )}
                  <span className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1 text-xs font-medium uppercase text-slate-900 shadow-sm tracking-[0.14em]">
                    {project.status}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="font-display text-2xl">{dto.title}</h2>
                  <p className="mt-2 text-sm text-mist">
                    {count} clips · {formatClock(dto.durationSeconds)} · {dto.sourcePlatform}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
