import type { CaptionStyleId, PlatformId, VibeId } from "@/lib/constants";

export type ClipKind = "hook" | "turn" | "climax" | "payoff" | "cta";

type Pack = {
  title: string;
  hook: string;
  caption: string;
  variants: string[];
  description: string;
  reason: string;
};

const HOOKS: Record<VibeId, string[]> = {
  hype: [
    "Wait for the last 3 seconds.",
    "Don't scroll. This is the part.",
    "This is why it went feral.",
    "Watch it twice. You'll see it.",
    "Nobody talks about this frame.",
  ],
  funny: [
    "The face at the end is illegal.",
    "I wasn't ready for this.",
    "Plot twist nobody asked for.",
    "This is my Roman Empire.",
    "The timing is actually evil.",
  ],
  educational: [
    "Save this before you forget.",
    "The trick is in the middle.",
    "Most people skip this step.",
    "Do this once. Thank me later.",
    "You're doing this backwards.",
  ],
  storytime: [
    "I still can't believe this happened.",
    "Start to finish. Don't blink.",
    "The ending rewrote the story.",
    "This is the part I never posted.",
    "Keep watching. It flips.",
  ],
  luxury: [
    "Quiet luxury. Loud result.",
    "This is the standard now.",
    "Details people miss on purpose.",
    "If you know, you know.",
    "Taste is a pacing choice.",
  ],
  motivational: [
    "This is your sign to start.",
    "Watch this on a bad day.",
    "The shift happens right here.",
    "You don't need a new year.",
    "Stay till the last line.",
  ],
};

const CAPTIONS: Record<VibeId, string[]> = {
  hype: [
    "This is the clip they replay at 2am",
    "The drop everyone pretended not to wait for",
    "Main character energy in 15 seconds",
    "If this doesn't hit, your volume is off",
    "The internet was not ready for this cut",
    "Hook. Hold. Payoff. That's the whole sport",
  ],
  funny: [
    "I thought I was the problem. I was not",
    "The universe said 'absolutely not' in 4K",
    "This is why group chats go silent",
    "Certified 'send this to the group' moment",
    "Nothing is okay and that's the joke",
    "The unplanned second is the whole video",
  ],
  educational: [
    "Do this once and it looks expensive",
    "The 8-second fix creators gatekeep",
    "Stop overcomplicating the first frame",
    "This is the structure every viral clip uses",
    "Three beats. One payoff. Zero fluff",
    "If they can skip it, it isn't a hook",
  ],
  storytime: [
    "I only posted the beginning. Here's the rest",
    "The middle is where it actually happens",
    "This is the scene I almost cut",
    "It looks small until the last beat",
    "You needed the context. Here it is",
    "The callback hits harder the second time",
  ],
  luxury: [
    "No caption needed. Still getting one",
    "The cut is the flex",
    "Soft light. Hard opinion",
    "Made to look accidental. It wasn't",
    "Texture, timing, then silence",
    "If it feels expensive, it's the edit",
  ],
  motivational: [
    "You don't rise to the goal. You fall to the cut",
    "Start ugly. Finish loud",
    "The version of you who posts anyway",
    "Discipline looks boring until it compounds",
    "One more take. That's the whole secret",
    "Make the thing you keep describing",
  ],
};

const REASONS: Record<ClipKind, string[]> = {
  hook: [
    "Opens on a pattern interrupt — highest first-3-second retention.",
    "Cold open with motion and a dare. Algorithms love unfinished curiosity.",
    "Front-loads a promise so the swipe feels expensive.",
  ],
  turn: [
    "The story pivots here. Comments usually spike on the reversal.",
    "Mid-clip contrast — new location, new energy, new reason to stay.",
    "This is the 'wait what' beat that earns the rest of the watch.",
  ],
  climax: [
    "Peak visual energy. This is the screenshot / stitch bait.",
    "Highest motion density in the file — classic replay window.",
    "The moment people send without context.",
  ],
  payoff: [
    "Pays off the hook. Completes the loop so people rewind.",
    "The answer lands here. Save-worthy if the caption names the lesson.",
    "Resolution plus leftover mystery — good for 'part 2' comments.",
  ],
  cta: [
    "Last-window CTA. Best place for follow / duet / stitch language.",
    "Ends on a still-readable frame so profile taps have somewhere to land.",
    "Leaves a question unanswered on purpose.",
  ],
};

const HASHTAGS: Record<PlatformId, string[]> = {
  tiktok: ["#fyp", "#foryou", "#viral", "#edit", "#captionthis"],
  youtube: ["#shorts", "#youtubeshorts", "#viralshorts", "#subscribe"],
  facebook: ["#reels", "#fbreels", "#trending", "#share"],
  instagram: ["#reels", "#reelsinstagram", "#explore", "#viralreels"],
};

function pick<T>(list: T[], index: number) {
  return list[((index % list.length) + list.length) % list.length];
}

function titleFromKind(kind: ClipKind, index: number) {
  const names: Record<ClipKind, string[]> = {
    hook: ["Cold open", "Pattern interrupt", "Don't scroll"],
    turn: ["The turn", "Plot swing", "Wait-for-it"],
    climax: ["Peak frame", "Replay bait", "The drop"],
    payoff: ["Payoff", "The answer", "Loop close"],
    cta: ["End card energy", "Follow beat", "Part-two bait"],
  };
  return pick(names[kind], index);
}

export function buildCaptionPack(opts: {
  vibe: VibeId;
  platform: PlatformId;
  kind: ClipKind;
  index: number;
  sourceTitle: string;
}): Pack & { hashtags: string; style: CaptionStyleId } {
  const { vibe, platform, kind, index, sourceTitle } = opts;
  const hook = pick(HOOKS[vibe], index + kind.length);
  const caption = pick(CAPTIONS[vibe], index * 3 + kind.length);
  const altA = pick(CAPTIONS[vibe], index + 1);
  const altB = pick(CAPTIONS[vibe], index + 2);
  const altC = pick(HOOKS[vibe], index + 4);
  const reason = pick(REASONS[kind], index);
  const tags = HASHTAGS[platform];
  const extra =
    sourceTitle && sourceTitle.length < 48 ? `#${sourceTitle.replace(/[^a-z0-9]+/gi, "").slice(0, 14)}` : "#voltcut";
  const styles: CaptionStyleId[] = ["impact", "neon", "karaoke", "subtitle", "boxed", "meme"];
  const cta =
    platform === "youtube"
      ? "Subscribe if you want the long version."
      : platform === "facebook"
        ? "Share this to the chat that needs it."
        : platform === "instagram"
          ? "Save it. You'll want the structure later."
          : "Duet this with your version.";

  return {
    title: titleFromKind(kind, index),
    hook,
    caption,
    variants: [caption, altA, altB, altC].filter((item, i, arr) => arr.indexOf(item) === i),
    description: `${hook} ${caption}. ${cta}`,
    reason,
    hashtags: `${tags.join(" ")} ${extra}`.trim(),
    style: pick(styles, index + kind.length),
  };
}
