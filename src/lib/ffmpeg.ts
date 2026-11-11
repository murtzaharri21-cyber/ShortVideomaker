import { spawn } from "node:child_process";
import { chmodSync, existsSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import type { CaptionStyleId } from "@/lib/constants";
import { wrapCaption } from "@/lib/utils";

export type VideoInfo = {
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
  codec: string;
};

function firstExisting(candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    if (!candidate || !existsSync(candidate)) continue;
    try {
      const info = statSync(candidate);
      if (info.isFile() && info.size > 0) return candidate;
    } catch {
      // Try the next candidate when a bundled executable is missing or unreadable.
    }
  }
  return candidates[candidates.length - 1] ?? "";
}

const LOCAL_BIN = path.join(/* turbopackIgnore: true */ process.cwd(), "bin");
export const ffmpegBin = firstExisting([path.join(LOCAL_BIN, "ffmpeg"), ffmpegStatic, "/usr/bin/ffmpeg", "ffmpeg"]);
export const ffprobeBin = firstExisting([ffprobeStatic?.path, path.join(LOCAL_BIN, "ffprobe"), "/usr/bin/ffprobe", "ffprobe"]);

for (const bin of [ffmpegBin, ffprobeBin]) {
  try {
    if (bin.includes("/") && existsSync(bin)) chmodSync(bin, 0o755);
  } catch {
    // read-only filesystem; ignore
  }
}

const FONT_ROOT = "/usr/share/fonts";
const FONT_DIR = existsSync(FONT_ROOT) ? FONT_ROOT : "";

const FONT_FILE = firstExisting([
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
]);

export function fontFileExists(relativePath: string) {
  if (!relativePath) return false;
  return existsSync(path.join(FONT_ROOT, relativePath));
}

export function runCommand(bin: string, args: string[], timeoutMs = 180_000) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PATH: `${path.join(/* turbopackIgnore: true */ process.cwd(), "bin")}${path.delimiter}${process.env.PATH || ""}`,
      },
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Timed out: ${bin} ${args.slice(0, 6).join(" ")}`));
    }, timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else {
        const details = `${stderr}\n${stdout}`.replace(/\s+/g, " ").trim();
        reject(new Error(details.slice(-3000) || `${bin} exited with code ${code}`));
      }
    });
  });
}

export async function probeVideo(filePath: string): Promise<VideoInfo> {
  const { stdout } = await runCommand(ffprobeBin, [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);
  const parsed = JSON.parse(stdout) as {
    format?: { duration?: string };
    streams?: Array<{
      codec_type?: string;
      codec_name?: string;
      width?: number;
      height?: number;
      duration?: string;
    }>;
  };
  const video = parsed.streams?.find((stream) => stream.codec_type === "video");
  const audio = parsed.streams?.find((stream) => stream.codec_type === "audio");
  const duration = Number(parsed.format?.duration ?? video?.duration ?? 0);
  if (!video || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("Could not read video duration. Try another MP4, MOV, or WEBM file.");
  }
  return {
    duration,
    width: video.width ?? 0,
    height: video.height ?? 0,
    hasAudio: Boolean(audio),
    codec: video.codec_name ?? "h264",
  };
}

export async function takeScreenshot(input: string, output: string, timestamp: number) {
  const safeTime = Math.max(0.05, timestamp);
  await runCommand(ffmpegBin, [
    "-y",
    "-ss",
    safeTime.toFixed(3),
    "-i",
    input,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    output,
  ]);
}

function escapeFilterPath(filePath: string) {
  return filePath.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

function escapeAss(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/\n/g, "\\N");
}

function assTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const whole = Math.floor(s);
  const cs = Math.min(99, Math.round((s - whole) * 100));
  return `${h}:${String(m).padStart(2, "0")}:${String(whole).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function karaokeLine(caption: string, duration: number) {
  const words = caption.split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const per = Math.max(8, Math.round((duration / words.length) * 100));
  return words.map((word) => `{\\k${per}}${escapeAss(word)}`).join(" ");
}

export async function writeCaptionAss(opts: {
  filePath: string;
  hook: string;
  caption: string;
  duration: number;
  style: CaptionStyleId;
  fontFamily?: string;
  fontFile?: string;
  playResX?: number;
  playResY?: number;
}) {
  const caption = wrapCaption(opts.caption, opts.style === "subtitle" ? 28 : 22);
  const hook = wrapCaption(opts.hook, 28);
  const end = assTime(Math.max(opts.duration, 0.4));
  const family = opts.fontFamily && opts.fontFamily.trim() ? opts.fontFamily : "DejaVu Sans";
  const font = family.replace(/,/g, " ");
  const styles: Record<CaptionStyleId, { main: string; hook: string }> = {
    impact: {
      main: `Style: Main,${font},72,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,6,0,2,70,70,250,1`,
      hook: `Style: Hook,${font},42,&H00FFE03D,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,3,0,2,80,80,430,1`,
    },
    neon: {
      main: `Style: Main,${font},70,&H00FFE03D,&H000000FF,&H006A2DFF,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,2,70,70,260,1`,
      hook: `Style: Hook,${font},40,&H00FFFFFF,&H000000FF,&H006A2DFF,&H00000000,-1,0,0,0,100,100,0,0,1,3,0,2,80,80,430,1`,
    },
    karaoke: {
      main: `Style: Main,${font},68,&H00FFFFFF,&H00FFE03D,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,0,2,70,70,250,1`,
      hook: `Style: Hook,${font},40,&H00FFB4C8,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,3,0,2,80,80,430,1`,
    },
    subtitle: {
      main: `Style: Main,${font},48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,0,2,90,90,160,1`,
      hook: `Style: Hook,${font},34,&H00D9D9E8,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,90,90,250,1`,
    },
    boxed: {
      main: `Style: Main,${font},58,&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,-1,0,0,0,100,100,0,0,3,0,0,2,90,90,240,1`,
      hook: `Style: Hook,${font},36,&H00000000,&H000000FF,&H00FFE03D,&H00FFE03D,-1,0,0,0,100,100,0,0,3,0,0,2,90,90,360,1`,
    },
    meme: {
      main: `Style: Main,${font},68,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,7,0,2,60,60,180,1`,
      hook: `Style: Hook,${font},64,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,7,0,8,60,60,140,1`,
    },
  };

  const chosen = styles[opts.style] ?? styles.impact;
  const mainText =
    opts.style === "karaoke" ? karaokeLine(opts.caption, opts.duration) : escapeAss(caption);
  const hookText = escapeAss(opts.style === "meme" ? hook.toUpperCase() : hook);
  const bodyText = opts.style === "meme" ? escapeAss(caption.toUpperCase()) : mainText;

  const body = `[Script Info]
ScriptType: v4.00+
PlayResX: ${opts.playResX ?? 1080}
PlayResY: ${opts.playResY ?? 1920}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${chosen.main}
${chosen.hook}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,${end},Hook,,0,0,0,,${hookText}
Dialogue: 0,0:00:00.00,${end},Main,,0,0,0,,${bodyText}
`;
  await writeFile(opts.filePath, body, "utf8");
}

export async function exportOriginalClip(opts: {
  input: string;
  output: string;
  start: number;
  duration: number;
  hasAudio: boolean;
  width?: number;
  height?: number;
  vertical?: boolean;
}) {
  const args = [
    "-y",
    "-ss",
    Math.max(0, opts.start).toFixed(3),
    "-i",
    opts.input,
    "-t",
    Math.max(0.4, opts.duration).toFixed(3),
  ];

  if (opts.vertical && opts.width && opts.height) {
    args.push(
      "-vf",
      `scale=${opts.width}:${opts.height}:force_original_aspect_ratio=increase,crop=${opts.width}:${opts.height},setsar=1,format=yuv420p`,
    );
  } else if (opts.width && opts.height) {
    args.push(
      "-vf",
      `scale=${opts.width}:${opts.height}:force_original_aspect_ratio=decrease,pad=${opts.width}:${opts.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p`,
    );
  } else {
    args.push("-vf", "format=yuv420p");
  }

  args.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "16",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  );
  if (opts.hasAudio) {
    args.push("-c:a", "aac", "-b:a", "192k");
  } else {
    args.push("-an");
  }
  args.push(opts.output);
  await runCommand(ffmpegBin, args, 180_000);
}

export async function exportCaptionedShort(opts: {
  input: string;
  output: string;
  assPath: string;
  start: number;
  duration: number;
  hasAudio: boolean;
  width?: number;
  height?: number;
  vertical?: boolean;
}) {
  const width = opts.width && opts.width > 0 ? opts.width : 1080;
  const height = opts.height && opts.height > 0 ? opts.height : 1920;
  const vertical = opts.vertical !== false;

  const subFilter = FONT_DIR
    ? `subtitles='${escapeFilterPath(opts.assPath)}':fontsdir='${escapeFilterPath(FONT_DIR)}'`
    : `subtitles='${escapeFilterPath(opts.assPath)}'`;

  const vf = vertical
    ? [
        "[0:v]split=2[bg][fg]",
        `[bg]scale=${Math.round(width / 4)}:${Math.round(height / 4)}:force_original_aspect_ratio=increase,crop=${Math.round(width / 4)}:${Math.round(height / 4)},gblur=sigma=12,scale=${width}:${height}[bg]`,
        `[fg]scale=${width}:${height}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p,${subFilter}[vout]`,
      ].join(";")
    : [
        "[0:v]split=2[bg][fg]",
        `[bg]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},gblur=sigma=12,scale=${width}:${height}[bg]`,
        `[fg]scale=${width}:${height}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2:format=auto,format=yuv420p,${subFilter}[vout]`,
      ].join(";");

  const args = [
    "-y",
    "-ss",
    Math.max(0, opts.start).toFixed(3),
    "-i",
    opts.input,
    "-t",
    Math.max(0.4, opts.duration).toFixed(3),
    "-filter_complex",
    vf,
    "-map",
    "[vout]",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  ];
  if (opts.hasAudio) {
    args.push("-map", "0:a", "-c:a", "aac", "-b:a", "192k", "-shortest");
  } else {
    args.push("-an");
  }
  args.push(opts.output);
  await runCommand(ffmpegBin, args, 180_000);
}

export function renderKey(input: {
  caption: string;
  hook: string;
  style: string;
  font?: string;
  resolution?: string;
  start: number;
  end: number;
}) {
  return [
    input.style,
    input.font ?? "dejavu",
    input.resolution ?? "1080",
    input.start.toFixed(3),
    input.end.toFixed(3),
    input.hook.trim(),
    input.caption.trim(),
  ].join("|");
}

export async function extractFrames(opts: {
  input: string;
  outputDir: string;
  timestamps: number[];
  width?: number;
}) {
  const width = opts.width && opts.width > 0 ? opts.width : 320;
  const frames: { timestamp: number; path: string }[] = [];
  for (const [index, timestamp] of opts.timestamps.entries()) {
    const file = path.join(opts.outputDir, `frame-${String(index).padStart(3, "0")}.jpg`);
    const safeTime = Math.max(0.05, timestamp);
    try {
      await runCommand(ffmpegBin, [
        "-y",
        "-ss",
        safeTime.toFixed(3),
        "-i",
        opts.input,
        "-frames:v",
        "1",
        "-vf",
        `scale=${width}:-2`,
        "-q:v",
        "4",
        file,
      ]);
      frames.push({ timestamp: safeTime, path: file });
    } catch {
      // skip frames that fail to decode
    }
  }
  return frames;
}

export async function detectSceneChanges(input: string, threshold = 0.08) {
  const { stderr } = await runCommand(ffmpegBin, [
    "-hide_banner",
    "-i",
    input,
    "-vf",
    `scale=320:-2,select='gt(scene,${threshold})',metadata=print`,
    "-an",
    "-f",
    "null",
    "-",
  ]);
  const changes: Array<{ timestamp: number; score: number }> = [];
  let timestamp: number | null = null;
  for (const line of stderr.split(/\r?\n/)) {
    const timeMatch = /pts_time:([\d.]+)/.exec(line);
    if (timeMatch) timestamp = Number(timeMatch[1]);
    const scoreMatch = /lavfi\.scene_score=([\d.]+)/.exec(line);
    if (scoreMatch && timestamp !== null) {
      changes.push({ timestamp, score: Number(scoreMatch[1]) });
      timestamp = null;
    }
  }
  return changes.filter((change) => Number.isFinite(change.timestamp) && Number.isFinite(change.score));
}

export function captionFontFile() {
  return FONT_FILE;
}

export function tempAssPath(outputMp4: string) {
  return outputMp4.replace(/\.mp4$/i, ".ass");
}

export function dirnameOf(filePath: string) {
  return path.dirname(filePath);
}
