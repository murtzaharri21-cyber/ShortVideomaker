"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { CaptionPreview } from "@/components/caption-preview";
import { PhoneFrame } from "@/components/phone-frame";
import { PlatformBadge } from "@/components/platform-marks";
import { CLIP_LENGTHS, MAX_UPLOAD_BYTES, PLATFORMS, VIBES, fontById } from "@/lib/constants";
import { downloadClip, downloadFullVideo } from "@/lib/download";
import type { ClipDTO, ProjectDTO } from "@/lib/clip-engine";
import { cn, formatClock, formatTimecode } from "@/lib/utils";

type DetectedFrame = {
  index: number;
  timestamp: number;
  score: number;
  reason: string;
  thumbnailUrl: string;
};

const FONT_STACKS: Record<string, string> = {
  dejavu: "Verdana, 'DejaVu Sans', sans-serif",
  "dejavu-serif": "Georgia, 'DejaVu Serif', serif",
  "dejavu-mono": "'Courier New', 'DejaVu Sans Mono', monospace",
  liberation: "Arial, 'Liberation Sans', sans-serif",
  "liberation-narrow": "'Arial Narrow', 'Liberation Sans Narrow', sans-serif",
  "liberation-serif": "'Times New Roman', 'Liberation Serif', serif",
  "liberation-mono": "'Courier New', 'Liberation Mono', monospace",
  freesans: "Helvetica, FreeSans, sans-serif",
  freeserif: "Georgia, FreeSerif, serif",
  freemono: "'Courier New', FreeMono, monospace",
  "nimbus-sans": "Helvetica, 'Nimbus Sans', sans-serif",
  "nimbus-narrow": "'Arial Narrow', 'Nimbus Sans Narrow', sans-serif",
  "nimbus-roman": "'Times New Roman', 'Nimbus Roman', serif",
  "nimbus-mono": "'Courier New', 'Nimbus Mono PS', monospace",
  "urw-gothic": "'Century Gothic', 'URW Gothic', sans-serif",
  "urw-bookman": "'Bookman Old Style', 'URW Bookman', serif",
};

export function ProjectWorkspace({
  project: initialProject,
  clips: initialClips,
}: {
  project: ProjectDTO;
  clips: ClipDTO[];
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [project, setProject] = useState(initialProject);
  const [clips, setClips] = useState(initialClips);
  const [activeId, setActiveId] = useState(initialClips[0]?.id ?? "");
  const [vibe, setVibe] = useState(initialProject.vibe);
  const [clipLength, setClipLength] = useState(initialProject.clipLength);
  const [platforms, setPlatforms] = useState(initialProject.targetPlatforms);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState(initialProject.title);
  const [drag, setDrag] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(initialProject.sourceUrl || "");
  const [frames, setFrames] = useState<DetectedFrame[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(Math.min(30, initialProject.durationSeconds || 30));

  const active = clips.find((clip) => clip.id === activeId) ?? clips[0];
  const needsVideo = project.status === "needs_video" || !project.videoUrl;
  const colors = ["#ff2d6a", "#3de0ff", "#ffd166", "#f4efe7", "#c084fc", "#4ade80", "#fb923c"];

  async function saveTitle() {
    const next = title.trim();
    if (!next || next === project.title) return;
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: next }),
    });
  }

  async function regenerate() {
    setBusy("Scanning for hooks…");
    setError("");
    try {
      const response = await fetch(`/api/projects/${project.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, clipLength, platforms }),
      });
      const data = (await response.json()) as { error?: string; project?: ProjectDTO; clips?: ClipDTO[] };
      if (!response.ok || !data.project || !data.clips) throw new Error(data.error || "Generate failed.");
      setProject(data.project);
      setClips(data.clips);
      setActiveId(data.clips[0]?.id ?? "");
      setFrames([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not regenerate.");
    } finally {
      setBusy("");
    }
  }

  async function detectFrames() {
    setBusy("Scanning frames for viral moments…");
    setError("");
    try {
      const response = await fetch(`/api/projects/${project.id}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibe,
          clipLength: clipLength === "auto" ? "15" : clipLength,
          platforms,
          sampleCount: 40,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        project?: ProjectDTO;
        clips?: ClipDTO[];
        frames?: DetectedFrame[];
      };
      if (!response.ok || !data.project || !data.clips) throw new Error(data.error || "Detection failed.");
      setProject(data.project);
      setClips(data.clips);
      setFrames(data.frames ?? []);
      setActiveId(data.clips[0]?.id ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not detect viral frames.");
    } finally {
      setBusy("");
    }
  }

  async function applySourceResult(response: Response) {
    const data = (await response.json()) as { error?: string; project?: ProjectDTO; clips?: ClipDTO[] };
    if (!response.ok || !data.project) {
      throw new Error(data.error || "Could not attach video.");
    }
    setProject(data.project);
    setClips(data.clips ?? []);
    setActiveId(data.clips?.[0]?.id ?? "");
    setFrames([]);
    router.refresh();
  }

  async function attachFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("File is over 120MB.");
      return;
    }
    setBusy("Ingesting source and cutting clips…");
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch(`/api/projects/${project.id}/source`, { method: "POST", body: form });
      await applySourceResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not attach video.");
    } finally {
      setBusy("");
    }
  }

  async function generateFromSample() {
    setBusy("Generating clips from sample footage…");
    setError("");
    try {
      const form = new FormData();
      form.set("sample", "1");
      const response = await fetch(`/api/projects/${project.id}/source`, { method: "POST", body: form });
      await applySourceResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate clips.");
    } finally {
      setBusy("");
    }
  }

  async function importSourceUrl() {
    if (!sourceUrl.trim()) {
      setError("Paste a video link first.");
      return;
    }
    setBusy("Fetching the full video and rebuilding clips…");
    setError("");
    try {
      const form = new FormData();
      form.set("url", sourceUrl.trim());
      const response = await fetch(`/api/projects/${project.id}/source`, { method: "POST", body: form });
      await applySourceResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import that link.");
    } finally {
      setBusy("");
    }
  }

  async function removeProject() {
    if (!confirm("Delete this project and its clips?")) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/library");
    router.refresh();
  }

  async function exportClip(id: string, mode: "captioned" | "original") {
    setBusy(mode === "captioned" ? "Rendering 9:16 with subtitles…" : "Exporting full-quality cut…");
    setError("");
    try {
      await downloadClip(id, mode, mode === "original" ? { resolution: "source" } : {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy("");
    }
  }

  async function exportFullVideo() {
    setBusy("Preparing full source video…");
    setError("");
    try {
      await downloadFullVideo(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the full video.");
    } finally {
      setBusy("");
    }
  }

  const duration = Math.max(project.durationSeconds, 0.01);
  const selectionDuration = selectionEnd - selectionStart;

  async function createSelectedClip() {
    if (selectionDuration < 1 || selectionDuration > 180) {
      setError("Choose a clip between 1 second and 3 minutes.");
      return;
    }
    setBusy("Saving your clip…");
    setError("");
    try {
      const response = await fetch(`/api/projects/${project.id}/clips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startSeconds: selectionStart, endSeconds: selectionEnd }),
      });
      const data = (await response.json()) as { clip?: ClipDTO; error?: string };
      if (!response.ok || !data.clip) throw new Error(data.error || "Could not save this clip.");
      setClips((current) => [...current, data.clip!].sort((a, b) => a.startSeconds - b.startSeconds));
      setActiveId(data.clip.id);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this clip.");
    } finally {
      setBusy("");
    }
  }

  const ticks = useMemo(() => {
    const count = 6;
    return Array.from({ length: count }, (_, index) => (duration * index) / (count - 1));
  }, [duration]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/library" className="text-sm text-mist hover:text-sand">
            ← Library
          </Link>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={saveTitle}
            className="mt-2 block w-full bg-transparent font-display text-3xl outline-none md:text-4xl"
          />
          <p className="mt-1 text-sm text-mist">
            {project.sourcePlatform} · {formatClock(project.durationSeconds)} · {project.width}×{project.height} ·{" "}
            {clips.length} clips
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!needsVideo ? (
            <>
              {sourceUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Re-fetch the saved link as a full-length source and replace the current clips?")) {
                      void importSourceUrl();
                    }
                  }}
                  disabled={Boolean(busy)}
                  className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                  title="Re-import the saved link without shortening the source video"
                >
                  Reload full source
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void exportFullVideo()}
                disabled={Boolean(busy)}
                className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50"
              >
                Download full video
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={detectFrames}
            disabled={Boolean(busy) || needsVideo}
            className="rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Find more good clips
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={Boolean(busy) || needsVideo}
            className="rounded-xl bg-volt text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Regenerate
          </button>
          <button type="button" onClick={removeProject} className="rounded-xl border border-line px-4 py-2 text-sm text-mist">
            Delete
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p> : null}
      {busy ? <p className="mt-4 text-sm text-cyan">{busy}</p> : null}
      {project.errorMessage ? (
        <p className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-sand">
          {project.errorMessage}
        </p>
      ) : null}

      {needsVideo ? (
        <div className="mt-8 grid gap-4">
          <label
            className={cn("dropzone block cursor-pointer rounded-2xl px-6 py-14 text-center", drag && "active")}
            onDragOver={(event) => {
              event.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDrag(false);
              const file = event.dataTransfer.files?.[0];
              if (file) void attachFile(file);
            }}
          >
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.mov,.webm,.mkv,.m4v"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void attachFile(file);
              }}
            />
            <p className="font-display text-2xl">Drop the source video</p>
            <p className="mt-2 text-sm text-mist">
              {project.sourceUrl ? `Saved link: ${project.sourceUrl}` : "MP4, MOV, or WEBM up to 120MB."}
            </p>
          </label>
          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">Or fetch the link again</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="min-w-0 flex-1 rounded-2xl border border-line bg-ink px-4 py-3 outline-none"
              />
              <button type="button" onClick={() => void importSourceUrl()} className="rounded-xl bg-volt text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold">
                Fetch & cut
              </button>
            </div>
            <button type="button" onClick={() => void generateFromSample()} className="mt-3 text-sm text-cyan">
              Generate clips from sample footage
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-2xl border border-line bg-ink-2">
            <video
              key={project.updatedAt}
              ref={videoRef}
              src={project.videoUrl}
              poster={project.thumbnailUrl}
              controls
              preload="metadata"
              onTimeUpdate={(event) => {
                const time = event.currentTarget.currentTime;
                setCurrentTime(time);
                if (time >= selectionEnd) event.currentTarget.pause();
              }}
              className="aspect-video w-full bg-black"
            />
            <div className="p-4">
              <div className="mb-2 flex justify-between text-[11px] uppercase tracking-[0.14em] text-mist">
                {ticks.map((tick) => (
                  <span key={tick}>{formatClock(tick)}</span>
                ))}
              </div>
              <div className="timeline-track">
                {frames.map((frame) => (
                  <button
                    key={`frame-${frame.index}`}
                    type="button"
                    onClick={() => {
                      const video = videoRef.current;
                      if (video) {
                        video.currentTime = frame.timestamp;
                        video.play().catch(() => undefined);
                      }
                    }}
                    className="absolute top-1 h-4 rounded-md border border-cyan/70"
                    style={{
                      left: `${(frame.timestamp / duration) * 100}%`,
                      width: "6px",
                      background: "rgba(61,224,255,0.35)",
                    }}
                    title={`${formatTimecode(frame.timestamp)} · est. score ${frame.score}`}
                    aria-label={`Jump to detected frame at ${formatTimecode(frame.timestamp)}`}
                  />
                ))}
                {clips.map((clip, index) => (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => {
                      setActiveId(clip.id);
                      const video = videoRef.current;
                      if (video) {
                        video.currentTime = clip.startSeconds;
                        video.play().catch(() => undefined);
                      }
                    }}
                    className="absolute top-2 h-10 rounded-xl"
                    style={{
                      left: `${(clip.startSeconds / duration) * 100}%`,
                      width: `${((clip.endSeconds - clip.startSeconds) / duration) * 100}%`,
                      background: colors[index % colors.length],
                      opacity: clip.id === active?.id ? 1 : 0.55,
                    }}
                    title={clip.title}
                    aria-label={`Play clip ${clip.title} from ${formatTimecode(clip.startSeconds)}`}
                  />
                ))}
                <div
                  className="absolute inset-y-0 w-0.5 bg-sand"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-mist">
                Click a colored block to jump to a clip. Cyan ticks mark suggested scene-change moments.
              </p>
              <div className="mt-5 rounded-xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Make a clip from any part</p>
                    <p className="mt-1 text-xs text-slate-600">Set a range on the full video, then save an HQ source-size cut.</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {formatTimecode(selectionStart)}–{formatTimecode(selectionEnd)} · {selectionDuration.toFixed(1)}s
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium text-slate-700">
                    Start time (seconds)
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={selectionStart}
                      onChange={(event) => setSelectionStart(Math.min(duration, Math.max(0, Number(event.target.value))))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-slate-700">
                    End time (seconds)
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      step={0.1}
                      value={selectionEnd}
                      onChange={(event) => setSelectionEnd(Math.min(duration, Math.max(0, Number(event.target.value))))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectionStart(Math.min(currentTime, Math.max(0, selectionEnd - 1)))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
                  >
                    Set start at playhead
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionEnd(Math.min(duration, Math.max(currentTime, selectionStart + 1)))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
                  >
                    Set end at playhead
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const video = videoRef.current;
                      if (!video) return;
                      video.currentTime = selectionStart;
                      void video.play().catch(() => undefined);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
                  >
                    Preview selection
                  </button>
                  <button
                    type="button"
                    onClick={() => void createSelectedClip()}
                    disabled={Boolean(busy) || selectionDuration < 1 || selectionDuration > 180}
                    className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Save custom clip
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">Engine</p>
            <label className="mt-4 block text-sm">
              Vibe
              <select
                value={vibe}
                onChange={(event) => setVibe(event.target.value as typeof vibe)}
                className="mt-2 w-full rounded-2xl border border-line bg-ink px-3 py-2"
              >
                {VIBES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm">
              Length
              <select
                value={clipLength}
                onChange={(event) => setClipLength(event.target.value as typeof clipLength)}
                className="mt-2 w-full rounded-2xl border border-line bg-ink px-3 py-2"
              >
                {CLIP_LENGTHS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setPlatforms((current) =>
                      current.includes(item.id)
                        ? current.length === 1
                          ? current
                          : current.filter((value) => value !== item.id)
                        : [...current, item.id],
                    )
                  }
                  className={cn(
                    "rounded-xl border px-3 py-1 text-xs",
                    platforms.includes(item.id) ? "border-cyan text-sand" : "border-line text-mist",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {active ? (
              <div className="mt-6 text-sm text-mist">
                <p className="text-sand">{active.title}</p>
                <p className="mt-1">
                  {formatTimecode(active.startSeconds)} → {formatTimecode(active.endSeconds)}
                </p>
                <p className="mt-3 text-sand">{active.reason}</p>
                <p className="mt-2 text-xs">
                  {fontById(active.captionFont).label} · {active.captionStyle}
                </p>
              </div>
            ) : null}
            <label className="mt-6 block cursor-pointer rounded-2xl border border-dashed border-line px-3 py-3 text-center text-xs text-mist">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm,.mkv,.m4v"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void attachFile(file);
                }}
              />
              Replace source video
            </label>
          </div>
        </div>
      )}

      {frames.length ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl">Suggested moments</h2>
            <p className="text-sm text-mist">Ranked from scene changes and video coverage. Review before posting.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {frames.map((frame) => (
              <button
                key={frame.index}
                type="button"
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.currentTime = frame.timestamp;
                    video.play().catch(() => undefined);
                  }
                }}
                className="overflow-hidden rounded-2xl border border-line bg-ink-2 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gold">{frame.score}</span>
                    <span className="text-[11px] text-mist">{formatTimecode(frame.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-xs text-mist">{frame.reason}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {clips.map((clip) => (
          <article key={clip.id} className="rounded-2xl border border-line bg-ink-2 p-4">
            <div className="mx-auto max-w-[240px]">
              <PhoneFrame>
                {clip.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clip.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : project.videoUrl ? (
                  <video src={`${project.videoUrl}#t=${clip.startSeconds}`} className="h-full w-full object-cover" muted />
                ) : null}
                <CaptionPreview
                  hook={clip.hook}
                  caption={clip.caption}
                  style={clip.captionStyle}
                  fontFamily={FONT_STACKS[clip.captionFont] ?? FONT_STACKS.dejavu}
                />
              </PhoneFrame>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <PlatformBadge platform={clip.platform} />
              <span className="text-sm font-semibold text-gold">
                {clip.viralityScore > 0 ? clip.viralityScore : "Custom"}
              </span>
            </div>
            <h3 className="mt-3 font-display text-xl">{clip.title}</h3>
            <p className="mt-1 text-sm text-mist">
              {formatTimecode(clip.startSeconds)}–{formatTimecode(clip.endSeconds)} · {clip.captionStyle} ·{" "}
              {fontById(clip.captionFont).label}
            </p>
            <p className="mt-3 text-sm">{clip.caption}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/projects/${project.id}/clips/${clip.id}`}
                className="rounded-xl bg-sand px-3 py-1.5 text-sm font-semibold text-ink"
              >
                Edit & export
              </Link>
              <button
                type="button"
                onClick={() => void exportClip(clip.id, "captioned")}
                className="rounded-xl border border-line px-3 py-1.5 text-sm"
              >
                9:16
              </button>
              <button
                type="button"
                onClick={() => void exportClip(clip.id, "original")}
                className="rounded-xl border border-line px-3 py-1.5 text-sm"
              >
                HQ clip
              </button>
            </div>
          </article>
        ))}
      </div>

      {!clips.length && !needsVideo ? (
        <p className="mt-10 text-mist">No clips yet. Find good moments or regenerate after the source is ready.</p>
      ) : null}
    </div>
  );
}
