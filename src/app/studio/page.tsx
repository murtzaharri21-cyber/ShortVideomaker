import { StudioForm } from "@/components/studio-form";

export const metadata = {
  title: "Studio — VoltCut",
};

export default function StudioPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-mist">Studio</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95]">Feed it a video. Leave with shorts.</h1>
        <p className="mt-4 max-w-md text-mist">
          Upload a file, paste a public MP4, or import a social link. VoltCut windows the viral beats, writes captions,
          and exports 9:16 in full quality.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-mist">
          <li>— Paste a YouTube, TikTok, Facebook, or Instagram link and we fetch + cut it.</li>
          <li>— Captions: impact, neon, karaoke, subtitle, boxed, meme.</li>
          <li>— HQ cut keeps source resolution. Captioned export is 1080×1920.</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-line bg-ink-2 p-6 md:p-8">
        <StudioForm />
      </div>
    </main>
  );
}
