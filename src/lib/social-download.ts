import { chmod, readdir, rename, stat, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { ffmpegBin, probeVideo, runCommand } from "@/lib/ffmpeg";
import { ensureDir, mediaAbs } from "@/lib/storage";

const BIN_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "bin");
const WINDOWS = process.platform === "win32";
const YTDLP_PATH = path.join(BIN_DIR, WINDOWS ? "yt-dlp.exe" : "yt-dlp");
const YTDLP_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${WINDOWS ? "yt-dlp.exe" : "yt-dlp"}`;
const IMPORT_TIMEOUT_MS = 30 * 60 * 1000;

export async function ensureYtDlp() {
  await ensureDir(BIN_DIR);
  if (!existsSync(YTDLP_PATH)) {
    const response = await fetch(YTDLP_URL, { redirect: "follow", signal: AbortSignal.timeout(60_000) });
    if (!response.ok) {
      throw new Error("Could not install the video importer.");
    }
    await writeFile(YTDLP_PATH, Buffer.from(await response.arrayBuffer()));
  }
  if (!WINDOWS) await chmod(YTDLP_PATH, 0o755);
  return YTDLP_PATH;
}

async function findImportedFile(dir: string) {
  const files = await readdir(dir);
  const matches = files.filter(
    (name) => /\.(mp4|webm|mkv|mov|m4v)$/i.test(name) && !/^source/i.test(name) && !name.endsWith(".bak"),
  );
  if (!matches.length) return null;
  const ranked = await Promise.all(
    matches.map(async (name) => {
      const full = path.join(dir, name);
      const info = await stat(full);
      return { full, size: info.size };
    }),
  );
  ranked.sort((a, b) => b.size - a.size);
  return ranked[0]?.size ? ranked[0].full : null;
}

const FORMAT = "bv*+ba/b";

export async function downloadVideoFromUrl(
  url: string,
  projectId: string,
): Promise<{ path: string }> {
  const ytdlp = await ensureYtDlp();
  const dir = mediaAbs("projects", projectId);
  await ensureDir(dir);
  const template = path.join(dir, "import.%(ext)s");
  let lastError = "Could not download that video.";

  try {
    const { stdout } = await runCommand(
      ytdlp,
      [
        "--no-playlist",
        "--no-progress",
        "--force-overwrites",
        "--no-part",
        "--retries",
        "3",
        "--fragment-retries",
        "3",
        "--socket-timeout",
        "30",
        "--geo-bypass",
        "--user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "-f",
        FORMAT,
        "--merge-output-format",
        "mp4",
        "--ffmpeg-location",
        path.dirname(ffmpegBin),
        "-o",
        template,
        "--print",
        "after_move:%(filepath)s",
        "--js-runtimes",
        `node:${process.execPath}`,
        url,
      ],
      IMPORT_TIMEOUT_MS,
    );
    const printed = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => path.isAbsolute(line) || /\.(mp4|webm|mkv|mov|m4v)$/i.test(line))
      .at(-1);
    const imported = (printed && existsSync(printed) ? printed : null) || (await findImportedFile(dir));
    if (!imported) {
      throw new Error("The download finished without a video file.");
    }
    const dest = mediaAbs("projects", projectId, "source.mp4");
    await writePlayableMp4(imported, dest);
    if (path.resolve(imported) !== path.resolve(dest) && existsSync(imported)) {
      try {
        await unlink(imported);
      } catch {
        try {
          await rename(imported, `${imported}.bak`);
        } catch {
          // leftover import file is harmless
        }
      }
    }
    return { path: dest };
  } catch (error) {
    lastError = error instanceof Error ? error.message : lastError;
  }
  throw new Error(cleanYtDlpError(lastError));
}

export async function writePlayableMp4(input: string, output: string) {
  const info = await probeVideo(input);
  const same = path.resolve(input) === path.resolve(output);
  if (info.codec === "h264" && /\.mp4$/i.test(input)) {
    if (!same) {
      await runCommand(ffmpegBin, ["-y", "-i", input, "-c", "copy", "-movflags", "+faststart", output], 120_000);
    }
    return output;
  }
  const tmp = same ? output.replace(/\.mp4$/i, ".tmp.mp4") : output;
  const args = [
    "-y",
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  ];
  if (info.hasAudio) args.push("-c:a", "aac", "-b:a", "160k");
  else args.push("-an");
  args.push(tmp);
  await runCommand(ffmpegBin, args, 180_000);
  if (tmp !== output) {
    await rename(tmp, output);
  }
  return output;
}

function cleanYtDlpError(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  if (/this video is private|private video|members only|join this channel/i.test(compact)) {
    return "That video is private.";
  }
  if (/confirm you.?re not a bot|use --cookies|sign in to confirm/i.test(compact)) {
    return "The platform blocked the automated fetch. Try another public link, or upload the MP4.";
  }
  if (/404|unavailable|removed|does not exist/i.test(compact)) {
    return "That video is unavailable.";
  }
  if (/max-filesize|file is larger/i.test(compact)) {
    return "The video is too large for the available storage. Try a shorter video.";
  }
  if (/timed out:/i.test(compact)) {
    return "Downloading the full video timed out. Try again on a faster connection or use a shorter source.";
  }
  if (/requested format is not available|no video formats found/i.test(compact)) {
    return "The platform did not provide a downloadable video format for that link. Check that the post is public, or upload the video file.";
  }
  return "Could not pull that social video. Make sure the post is public, or upload the MP4.";
}
