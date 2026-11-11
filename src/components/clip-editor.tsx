"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DevicePreview } from "@/components/device-preview";
import { PlatformBadge } from "@/components/platform-marks";
import {
  CAPTION_FONTS,
  CAPTION_STYLES,
  PLATFORMS,
  RESOLUTIONS,
  fontById,
  resolutionById,
} from "@/lib/constants";
import type { ClipDTO, ProjectDTO } from "@/lib/clip-engine";
import { downloadClip } from "@/lib/download";
import { cn, formatTimecode } from "@/lib/utils";

const CLIP_FONT_STACK: Record<string, string> = {
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

export function ClipEditor({ project, clip: initial }: { project: ProjectDTO; clip: ClipDTO }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clip, setClip] = useState(initial);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [duration, setDuration] = useState(project.durationSeconds || 60);
  const [currentTime, setCurrentTime] = useState(initial.startSeconds);
  const [trimStart, setTrimStart] = useState(initial.startSeconds);
  const [trimEnd, setTrimEnd] = useState(initial.endSeconds);
  const [resolution, setResolution] = useState(initial.resolution || "1080");
  const [font, setFont] = useState(initial.captionFont || "dejavu");
  const [style, setStyle] = useState(initial.captionStyle || "impact");
  const [caption, setCaption] = useState(initial.caption);
  const [hook, setHook] = useState(initial.hook);

  const fontMeta = fontById(font);
  const resMeta = resolutionById(resolution);
  const fontStack = CLIP_FONT_STACK[font] ?? CLIP_FONT_STACK.dejavu;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
    };
    const onTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("timeupdate", onTime);
    if (video.readyState >= 1) onMeta();
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration - 0.05));
    video.play().catch(() => undefined);
  }, [duration]);

  async function patch(partial: Partial<ClipDTO>) {
    setClip((current) => ({ ...current, ...partial }));
    const response = await fetch(`/api/clips/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const data = (await response.json()) as { clip?: ClipDTO; error?: string };
    if (data.clip) setClip(data.clip);
    if (!response.ok) setError(data.error || "Could not save.");
  }

  async function exportClip(mode: "captioned" | "original") {
    setBusy(mode === "captioned" ? `Rendering ${resMeta.label} with captions…` : "Exporting full-quality cut…");
    setError("");
    try {
      await downloadClip(clip.id, mode, mode === "original" ? { resolution: "source" } : { resolution, font });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy("");
    }
  }

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 1200);
  }

  function applyTrim() {
    const start = Math.max(0, Math.min(trimStart, duration - 0.5));
    const end = Math.max(start + 0.5, Math.min(trimEnd, duration));
    setTrimStart(start);
    setTrimEnd(end);
    void patch({ startSeconds: start, endSeconds: end });
    seek(start);
  }

  const clipLength = Math.max(0, trimEnd - trimStart);
  const trimLeft = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimWidth = duration > 0 ? (clipLength / duration) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={`/projects/${project.id}`} className="text-sm text-mist hover:text-sand">
            ← {project.title}
          </Link>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">Edit clip</h1>
          <p className="mt-1 text-sm text-mist">
            {project.width}×{project.height} source · {formatTimecode(duration)} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PlatformBadge platform={clip.platform} />
          <span className="rounded-xl bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
            {clip.viralityScore} viral
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-black">
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={project.thumbnailUrl}
              controls
              preload="metadata"
              className="aspect-video w-full bg-black"
            />
          </div>

          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-mist">Cut & trim</p>
              <div className="flex gap-2 text-xs text-mist">
                <span className="rounded-xl bg-slate-100 px-2.5 py-1">
                  In {formatTimecode(trimStart)}
                </span>
                <span className="rounded-xl bg-slate-100 px-2.5 py-1">
                  Out {formatTimecode(trimEnd)}
                </span>
                <span className="rounded-xl bg-slate-900 px-2.5 py-1 text-white">
                  {clipLength.toFixed(1)}s
                </span>
              </div>
            </div>

            <div className="relative mt-4 h-16 overflow-hidden rounded-2xl bg-slate-100">
              <div
                className="absolute inset-y-2 rounded-xl bg-volt/25"
                style={{ left: `${trimLeft}%`, width: `${trimWidth}%` }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-cyan"
                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Start
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration - 0.5, 0)}
                  step={0.1}
                  value={trimStart}
                  onChange={(event) => {
                    const value = Math.min(Number(event.target.value), trimEnd - 0.5);
                    setTrimStart(value);
                    setCurrentTime(value);
                  }}
                  className="mt-2 w-full"
                />
              </label>
              <label className="text-sm">
                End
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration - 0.2, 0)}
                  step={0.1}
                  value={trimEnd}
                  onChange={(event) => {
                    const value = Math.max(Number(event.target.value), trimStart + 0.5);
                    setTrimEnd(value);
                  }}
                  className="mt-2 w-full"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={applyTrim} className="rounded-xl bg-volt text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold">
                Apply cut
              </button>
              <button type="button" onClick={() => seek(trimStart)} className="rounded-xl border border-line px-4 py-2 text-sm">
                Preview cut
              </button>
              <button
                type="button"
                onClick={() => {
                  const start = Math.max(0, currentTime - 5);
                  const end = Math.min(duration, currentTime + 5);
                  setTrimStart(start);
                  setTrimEnd(end);
                  void patch({ startSeconds: start, endSeconds: end });
                }}
                className="rounded-xl border border-line px-4 py-2 text-sm"
              >
                10s around playhead
              </button>
              <button
                type="button"
                onClick={() => {
                  const start = 0;
                  const end = Math.min(duration, 15);
                  setTrimStart(start);
                  setTrimEnd(end);
                  void patch({ startSeconds: start, endSeconds: end });
                }}
                className="rounded-xl border border-line px-4 py-2 text-sm"
              >
                First 15s
              </button>
              <button
                type="button"
                onClick={() => {
                  const start = Math.max(0, duration - 15);
                  setTrimStart(start);
                  setTrimEnd(duration);
                  void patch({ startSeconds: start, endSeconds: duration });
                }}
                className="rounded-xl border border-line px-4 py-2 text-sm"
              >
                Last 15s
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-ink-2 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-mist">Subtitle font</p>
              <div className="mt-3 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
                {CAPTION_FONTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFont(item.id);
                      void patch({ captionFont: item.id });
                    }}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-left text-sm",
                      font === item.id ? "border-cyan bg-cyan/10" : "border-line",
                    )}
                    style={{ fontFamily: CLIP_FONT_STACK[item.id] }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-ink-2 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-mist">Download resolution</p>
              <div className="mt-3 grid gap-2">
                {RESOLUTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setResolution(item.id);
                      void patch({ resolution: item.id });
                    }}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-left",
                      resolution === item.id ? "border-gold bg-gold/10" : "border-line",
                    )}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-xs text-mist">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-mist">Screen preview</p>
            <DevicePreview
              src={project.videoUrl}
              poster={clip.thumbnailUrl || project.thumbnailUrl}
              start={trimStart}
              end={trimEnd}
              hook={hook}
              caption={caption}
              style={style}
              fontFamily={fontStack}
            />
            <p className="mt-3 text-center text-xs text-mist">
              {fontMeta.label} · {style} · export {resMeta.label}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">Caption style</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CAPTION_STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStyle(item.id);
                    void patch({ captionStyle: item.id });
                  }}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-left text-sm",
                    style === item.id ? "border-cyan bg-cyan/10" : "border-line",
                  )}
                >
                  <span className="block font-medium">{item.label}</span>
                  <span className="block text-xs text-mist">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <label className="grid gap-2 text-sm">
              Hook
              <input
                value={hook}
                onChange={(event) => setHook(event.target.value)}
                onBlur={() => void patch({ hook })}
                className="rounded-2xl border border-line bg-ink px-4 py-3 outline-none"
              />
            </label>
            <label className="mt-3 grid gap-2 text-sm">
              Caption
              <textarea
                value={caption}
                rows={3}
                onChange={(event) => setCaption(event.target.value)}
                onBlur={() => void patch({ caption })}
                className="rounded-2xl border border-line bg-ink px-4 py-3 outline-none"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {clip.variants.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => {
                    setCaption(variant);
                    void patch({ caption: variant });
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-left text-xs",
                    variant === caption ? "border-volt bg-volt/10" : "border-line",
                  )}
                >
                  {variant}
                </button>
              ))}
            </div>
            <label className="mt-3 grid gap-2 text-sm">
              Hashtags
              <textarea
                value={clip.hashtags}
                rows={2}
                onChange={(event) => setClip({ ...clip, hashtags: event.target.value })}
                onBlur={() => void patch({ hashtags: clip.hashtags })}
                className="rounded-2xl border border-line bg-ink px-4 py-3 outline-none"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void patch({ platform: item.id })}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-sm",
                    clip.platform === item.id ? "border-gold text-sand" : "border-line text-mist",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p> : null}
          {busy ? <p className="rounded-2xl bg-cyan/10 px-4 py-3 text-sm text-cyan">{busy}</p> : null}

          <div className="rounded-2xl border border-line bg-ink-2 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-mist">Download</p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => void exportClip("captioned")}
                disabled={Boolean(busy) || !project.videoUrl}
                className="rounded-xl bg-volt text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Download {resMeta.label} with subtitles
              </button>
              <button
                type="button"
                onClick={() => void exportClip("original")}
                disabled={Boolean(busy) || !project.videoUrl}
                className="rounded-xl border border-line px-4 py-2 text-sm disabled:opacity-50"
              >
                Download HQ clip
              </button>
              <button
                type="button"
                onClick={() => void copyText("caption", `${hook}\n${caption}\n\n${clip.hashtags}`)}
                className="rounded-xl border border-line px-4 py-2 text-sm"
              >
                {copied === "caption" ? "Copied" : "Copy caption pack"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="mt-3 text-sm text-cyan"
            >
              Back to all clips
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
