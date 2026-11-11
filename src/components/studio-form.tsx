"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { CLIP_LENGTHS, MAX_UPLOAD_BYTES, PLATFORMS, VIBES } from "@/lib/constants";
import { cn, formatBytes } from "@/lib/utils";

type Mode = "upload" | "link" | "demo";

export function StudioForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [vibe, setVibe] = useState("hype");
  const [clipLength, setClipLength] = useState("auto");
  const [platforms, setPlatforms] = useState<string[]>(["tiktok", "youtube", "facebook"]);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);

  const detected = useMemo(() => {
    const value = url.toLowerCase();
    if (value.includes("youtube") || value.includes("youtu.be")) return "YouTube link detected — we'll fetch the video and cut shorts.";
    if (value.includes("tiktok")) return "TikTok link detected — fetching the video and cutting shorts.";
    if (value.includes("facebook") || value.includes("fb.watch")) return "Facebook link detected — fetching the Reel and cutting shorts.";
    if (value.includes("instagram")) return "Instagram link detected — fetching the video and cutting shorts.";
    if (/\.(mp4|webm|mov|m4v)(\?|$)/.test(value)) return "Direct video file. We'll download and cut it.";
    return "We'll try to pull the video from that link and generate clips.";
  }, [url]);

  function togglePlatform(id: string) {
    setPlatforms((current) => {
      if (current.includes(id)) {
        return current.length === 1 ? current : current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  }

  function onFiles(list: FileList | null) {
    const next = list?.[0];
    if (!next) return;
    if (next.size > MAX_UPLOAD_BYTES) {
      setError(`Max size is ${formatBytes(MAX_UPLOAD_BYTES)}.`);
      return;
    }
    setError("");
    setFile(next);
    if (!title) setTitle(next.name.replace(/\.[^.]+$/, "").slice(0, 80));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode !== "demo" && !consent) {
      setError("Please tick the confirmation box before generating clips.");
      return;
    }
    setBusy(true);
    setError("");
    setNote(
      mode === "demo"
        ? "Cutting the demo reel…"
        : mode === "link"
          ? "Fetching the full video and cutting shorts… This may take a while for long videos."
          : "Reading the timeline and writing captions…",
    );
    try {
      if (mode === "demo") {
        const response = await fetch("/api/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title || "VoltCut demo cut", vibe, clipLength, platforms }),
        });
        const data = (await response.json()) as { error?: string; project?: { id: string } };
        if (!response.ok || !data.project) throw new Error(data.error || "Demo failed.");
        router.push(`/projects/${data.project.id}`);
        router.refresh();
        return;
      }

      const form = new FormData();
      form.set("title", title);
      form.set("vibe", vibe);
      form.set("clipLength", clipLength);
      form.set("platforms", platforms.join(","));
      form.set("consent", consent ? "1" : "0");
      if (mode === "upload") {
        if (!file) throw new Error("Drop a video first.");
        form.set("file", file);
      } else {
        if (!url.trim()) throw new Error("Paste a link first.");
        form.set("url", url.trim());
      }

      const response = await fetch("/api/projects", { method: "POST", body: form });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        project?: { id: string };
      };
      if (!response.ok || !data.project) throw new Error(data.error || "Could not create the project.");
      router.push(`/projects/${data.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
        {(
          [
            ["upload", "Upload file"],
            ["link", "Paste link"],
            ["demo", "Try demo"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm",
              mode === id ? "bg-sand text-ink" : "text-mist hover:text-sand",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <label
          className={cn("dropzone block cursor-pointer rounded-2xl px-6 py-12 text-center", drag && "active")}
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDrag(false);
            onFiles(event.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.mov,.webm,.mkv,.m4v"
            className="hidden"
            onChange={(event) => onFiles(event.target.files)}
          />
          <p className="font-display text-2xl">Drop the long video</p>
          <p className="mt-2 text-sm text-mist">MP4, MOV, WEBM up to 120MB. Vertical or landscape — we letterbox to 9:16.</p>
          {file ? (
            <p className="mt-4 text-sm text-cyan">
              {file.name} · {formatBytes(file.size)}
            </p>
          ) : null}
        </label>
      ) : null}

      {mode === "link" ? (
        <div className="rounded-2xl border border-line bg-slate-100 p-5">
          <label className="text-xs uppercase tracking-[0.16em] text-mist">Video URL</label>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://youtube.com/watch…  tiktok.com/@…  facebook.com/reel… or a direct .mp4"
            className="mt-2 w-full rounded-2xl border border-line bg-ink px-4 py-3 outline-none ring-cyan/40 focus:ring-2"
          />
          <p className="mt-3 text-sm text-mist">
            Paste a YouTube, TikTok, Facebook, or Instagram link. VoltCut fetches the complete video, finds the hooks,
            writes captions, and builds downloadable clips. Long imports may take several minutes.
          </p>
          {detected ? <p className="mt-2 text-sm text-cyan">{detected}</p> : null}
        </div>
      ) : null}

      {mode === "demo" ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <video src="/samples/demo.mp4" className="h-48 w-full object-cover" muted autoPlay loop playsInline />
          <div className="p-5">
            <p className="font-display text-xl">Run the engine on a 47s sample reel</p>
            <p className="mt-2 text-sm text-mist">
              Talking head, night drive, studio setup, fashion walk. We will cut hooks, write captions, and let you download
              1080×1920 exports.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.16em] text-mist">Project title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Summer drop / podcast cut / recipe"
            className="rounded-2xl border border-line bg-ink-2 px-4 py-3 outline-none ring-cyan/40 focus:ring-2"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.16em] text-mist">Clip length</span>
          <select
            value={clipLength}
            onChange={(event) => setClipLength(event.target.value)}
            className="rounded-2xl border border-line bg-ink-2 px-4 py-3 outline-none"
          >
            {CLIP_LENGTHS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-mist">Caption vibe</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {VIBES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVibe(item.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left",
                vibe === item.id ? "border-volt bg-volt/10" : "border-line bg-slate-100",
              )}
            >
              <span className="block font-medium">{item.label}</span>
              <span className="mt-1 block text-xs text-mist">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-mist">Export for</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => togglePlatform(item.id)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm",
                platforms.includes(item.id) ? "border-cyan bg-cyan/10 text-sand" : "border-line text-mist",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {mode !== "demo" ? (
        <label className="flex items-start gap-3 rounded-2xl border border-line bg-slate-50 p-4 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span>
            I am at least 13 years old (or have a parent&apos;s permission), and I own this video or have permission to edit
            and repost it. I agree to the{" "}
            <a href="/terms" className="text-blue-700 underline">Terms</a> and{" "}
            <a href="/privacy" className="text-blue-700 underline">Privacy Policy</a>. Projects are deleted after 7 days.
          </span>
        </label>
      ) : null}

      {error ? <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
      {busy ? <p className="text-sm text-cyan">{note}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-volt px-6 py-3 font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Generating clips…" : mode === "demo" ? "Generate demo shorts" : "Generate viral clips"}
      </button>
    </form>
  );
}
