export const APP_NAME = "VoltCut";
export const MAX_UPLOAD_BYTES = 120 * 1024 * 1024;
export const ALLOWED_VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "mkv", "avi"] as const;

export const VIBES = [
  { id: "hype", label: "Hype", hint: "Loud hooks, dare-you-to-scroll energy" },
  { id: "funny", label: "Funny", hint: "Deadpan setups and punchline cuts" },
  { id: "educational", label: "Educational", hint: "Save-this-tip explainers" },
  { id: "storytime", label: "Storytime", hint: "Wait-for-it narrative arcs" },
  { id: "luxury", label: "Luxury", hint: "Quiet flex, expensive pacing" },
  { id: "motivational", label: "Motivational", hint: "Second-wind speeches" },
] as const;

export const CLIP_LENGTHS = [
  { id: "auto", label: "Auto" },
  { id: "15", label: "15s" },
  { id: "21", label: "21s" },
  { id: "30", label: "30s" },
  { id: "45", label: "45s" },
  { id: "60", label: "60s" },
] as const;

export const PLATFORMS = [
  { id: "tiktok", label: "TikTok", ratio: "9:16" },
  { id: "youtube", label: "YouTube Shorts", ratio: "9:16" },
  { id: "facebook", label: "Facebook Reels", ratio: "9:16" },
  { id: "instagram", label: "Instagram Reels", ratio: "9:16" },
] as const;

export const CAPTION_STYLES = [
  { id: "impact", label: "Impact", hint: "Thick stroke, center-bottom, classic FYP" },
  { id: "neon", label: "Neon", hint: "Cyan fill, magenta glow" },
  { id: "karaoke", label: "Karaoke", hint: "Word-by-word pop" },
  { id: "subtitle", label: "Subtitle", hint: "Clean, YouTube-native" },
  { id: "boxed", label: "Boxed", hint: "Black pill behind the line" },
  { id: "meme", label: "Meme", hint: "Top hook + bottom punchline" },
] as const;

export const CAPTION_FONTS = [
  { id: "dejavu", label: "DejaVu Sans", file: "dejavu/DejaVuSans-Bold.ttf", family: "DejaVu Sans" },
  { id: "dejavu-serif", label: "DejaVu Serif", file: "dejavu/DejaVuSerif-Bold.ttf", family: "DejaVu Serif" },
  { id: "dejavu-mono", label: "DejaVu Mono", file: "dejavu/DejaVuSansMono-Bold.ttf", family: "DejaVu Sans Mono" },
  { id: "liberation", label: "Liberation Sans", file: "liberation/LiberationSans-Bold.ttf", family: "Liberation Sans" },
  { id: "liberation-narrow", label: "Liberation Narrow", file: "liberation/LiberationSansNarrow-Bold.ttf", family: "Liberation Sans Narrow" },
  { id: "liberation-serif", label: "Liberation Serif", file: "liberation/LiberationSerif-Bold.ttf", family: "Liberation Serif" },
  { id: "liberation-mono", label: "Liberation Mono", file: "liberation/LiberationMono-Bold.ttf", family: "Liberation Mono" },
  { id: "freesans", label: "FreeSans", file: "freefont/FreeSansBold.ttf", family: "FreeSans" },
  { id: "freeserif", label: "FreeSerif", file: "freefont/FreeSerifBold.ttf", family: "FreeSerif" },
  { id: "freemono", label: "FreeMono", file: "freefont/FreeMonoBold.ttf", family: "FreeMono" },
  { id: "nimbus-sans", label: "Nimbus Sans", file: "opentype/urw-base35/NimbusSans-Bold.otf", family: "Nimbus Sans" },
  { id: "nimbus-narrow", label: "Nimbus Sans Narrow", file: "opentype/urw-base35/NimbusSansNarrow-Bold.otf", family: "Nimbus Sans Narrow" },
  { id: "nimbus-roman", label: "Nimbus Roman", file: "opentype/urw-base35/NimbusRoman-Bold.otf", family: "Nimbus Roman" },
  { id: "nimbus-mono", label: "Nimbus Mono PS", file: "opentype/urw-base35/NimbusMonoPS-Bold.otf", family: "Nimbus Mono PS" },
  { id: "urw-gothic", label: "URW Gothic", file: "opentype/urw-base35/URWGothic-Demi.otf", family: "URW Gothic" },
  { id: "urw-bookman", label: "URW Bookman", file: "opentype/urw-base35/URWBookman-Demi.otf", family: "URW Bookman" },
] as const;

export const RESOLUTIONS = [
  { id: "1080", label: "1080 × 1920", hint: "Full HD vertical — best for TikTok & Shorts", width: 1080, height: 1920 },
  { id: "720", label: "720 × 1280", hint: "HD vertical — faster upload, smaller file", width: 720, height: 1280 },
  { id: "1440", label: "1440 × 2560", hint: "QHD vertical — crisp on 4K phones", width: 1440, height: 2560 },
  { id: "source", label: "Source size", hint: "Keeps the original resolution and framing", width: 0, height: 0 },
] as const;

export type VibeId = (typeof VIBES)[number]["id"];
export type ClipLengthId = (typeof CLIP_LENGTHS)[number]["id"];
export type PlatformId = (typeof PLATFORMS)[number]["id"];
export type CaptionStyleId = (typeof CAPTION_STYLES)[number]["id"];
export type CaptionFontId = (typeof CAPTION_FONTS)[number]["id"];
export type ResolutionId = (typeof RESOLUTIONS)[number]["id"];

export function isVibe(value: string): value is VibeId {
  return VIBES.some((item) => item.id === value);
}

export function isClipLength(value: string): value is ClipLengthId {
  return CLIP_LENGTHS.some((item) => item.id === value);
}

export function isPlatform(value: string): value is PlatformId {
  return PLATFORMS.some((item) => item.id === value);
}

export function isCaptionStyle(value: string): value is CaptionStyleId {
  return CAPTION_STYLES.some((item) => item.id === value);
}

export function isCaptionFont(value: string): value is CaptionFontId {
  return CAPTION_FONTS.some((item) => item.id === value);
}

export function isResolution(value: string): value is ResolutionId {
  return RESOLUTIONS.some((item) => item.id === value);
}

export function fontById(id: string) {
  return CAPTION_FONTS.find((item) => item.id === id) ?? CAPTION_FONTS[0];
}

export function resolutionById(id: string) {
  return RESOLUTIONS.find((item) => item.id === id) ?? RESOLUTIONS[0];
}
