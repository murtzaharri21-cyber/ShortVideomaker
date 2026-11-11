import Image from "next/image";
import Link from "next/link";
import { CaptionPreview } from "@/components/caption-preview";
import { PhoneFrame } from "@/components/phone-frame";
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from "@/components/platform-marks";
import { BlogCard } from "@/components/blog-card";
import { BLOG_POSTS } from "@/lib/blog";

const PHONES = [
  {
    image: "/images/short-1.jpg",
    hook: "Wait for the last 3 seconds.",
    caption: "This is the clip they replay at 2am",
    style: "impact",
    platform: "TikTok",
  },
  {
    image: "/images/short-2.jpg",
    hook: "The trick is in the middle.",
    caption: "Three beats. One payoff. Zero fluff",
    style: "neon",
    platform: "YT Shorts",
  },
  {
    image: "/images/short-4.jpg",
    hook: "I still can't believe this happened.",
    caption: "The middle is where it actually happens",
    style: "boxed",
    platform: "Reels",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Paste or drop",
    body: "A YouTube / TikTok / Facebook / Instagram link, a public MP4 URL, or a file off your desktop.",
  },
  {
    n: "02",
    title: "Find the wound",
    body: "VoltCut windows the hook, the turn, the peak, the payoff, and the CTA — not equal slices.",
  },
  {
    n: "03",
    title: "Write the line",
    body: "Six caption styles, platform hashtags, and alt lines you can tap onto the clip.",
  },
  {
    n: "04",
    title: "Export loud",
    body: "Download a full-quality cut, or a 1080×1920 short with burned-in captions and a blurred 9:16 fill.",
  },
];

const FEATURES = [
  {
    title: "Paste the link",
    body: "YouTube, TikTok, Facebook, Instagram, or a public MP4. We fetch the file, cut the hooks, and hand you captioned shorts.",
  },
  {
    title: "Caption styles that post",
    body: "Impact, neon, karaoke, subtitle, boxed, meme — previewed on a phone, burned in on export.",
  },
  {
    title: "Full-quality downloads",
    body: "HQ cuts keep the source resolution. Captioned shorts render at 1080×1920, CRF 18, ready to post.",
  },
  {
    title: "Vibe control",
    body: "Hype, funny, educational, storytime, luxury, motivational. Same footage, different internet.",
  },
];

const TOOL_FEATURES = [
  { icon: "🔗", title: "Paste any social link", body: "YouTube, TikTok, Facebook, Instagram, X, Vimeo, Reddit and more. We fetch the original file automatically." },
  { icon: "🎯", title: "Find promising moments", body: "Scene changes and full-video sampling surface moments worth reviewing. Suggestions are editing cues, not a prediction of views." },
  { icon: "✂️", title: "Precise trim & cut", body: "Mark custom in/out points anywhere in the source, preview the selection, and save a source-size high-quality clip." },
  { icon: "💬", title: "16 subtitle fonts, 6 styles", body: "Impact, neon, karaoke, boxed, meme or clean subtitles — burned into the export, not just the preview." },
  { icon: "📱", title: "Preview on every screen", body: "See your clip inside a phone, tablet, laptop or desktop frame with blur, fill or fit framing." },
  { icon: "⬇️", title: "Download in full quality", body: "Export 720p, 1080p, 1440p vertical, or keep the source resolution for an HQ cut." },
];

const USE_CASES = [
  { title: "Podcasters", body: "Turn a 60-minute episode into a stack of quote clips with captions people read on mute." },
  { title: "YouTubers", body: "Repurpose long uploads into Shorts that drive viewers back to the full video." },
  { title: "Brands & agencies", body: "Ship platform-ready Reels and TikToks from webinars, launches and interviews." },
  { title: "Coaches & educators", body: "Cut lessons into save-worthy tips with clean subtitle styles and hashtags." },
];

const FAQS = [
  { q: "What is VoltCut?", a: "VoltCut is a shorts builder. Paste a video link or upload a file, and it finds the most shareable moments, writes captions and exports vertical clips for TikTok, YouTube Shorts and Reels." },
  { q: "Which links can I paste?", a: "Public videos from YouTube, TikTok, Facebook, Instagram, X/Twitter, Vimeo, Reddit, Twitch and direct .mp4 links. Private or login-only posts need to be uploaded as a file." },
  { q: "How are good clip moments found?", a: "VoltCut looks for visual scene changes and samples across the full video to suggest moments for clips. These are editing suggestions, not a prediction of views, so review each clip before posting." },
  { q: "Can I change the subtitle font and style?", a: "Yes. Choose from 16 fonts and 6 caption styles in the editor. The preview updates live and the same look is burned into your download." },
  { q: "What resolutions can I download?", a: "720×1280, 1080×1920, 1440×2560, or the original source size. You can also download a full-quality cut without captions." },
  { q: "Does it cost anything?", a: "No. VoltCut is currently free with no hidden fees, subscriptions or watermarks. If paid plans are ever added, prices will be shown clearly before you pay and our Refund Policy will apply." },
  { q: "Is there a file size limit?", a: "Local uploads and direct video-file links are limited to 120MB. Supported social links are fetched as full-length videos and may take several minutes to process." },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-1 text-xs uppercase tracking-[0.18em] text-mist">
              Shorts · Reels · TikTok
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.7rem,8vw,6rem)] leading-[0.9] tracking-[-0.04em]">
              Long videos
              <br />
              die in the swipe.
              <br />
              <span className="text-cyan">Shorts don&apos;t.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mist">
              Paste a YouTube, TikTok, or Facebook link — or drop the file. VoltCut finds the 15 seconds people finish,
              writes captions they actually read, and lets you download them in full quality.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="rounded-xl bg-volt px-6 py-3 font-semibold text-white">
                Open the studio
              </Link>
              <Link href="/studio" className="rounded-xl border border-line px-6 py-3 text-sand">
                Run the demo reel
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-mist">
              <span className="flex items-center gap-1.5 text-sm">
                <TikTokIcon /> TikTok
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <YoutubeIcon /> Shorts
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <FacebookIcon /> Reels
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <InstagramIcon /> IG
              </span>
            </div>
          </div>

          <div className="relative mx-auto h-[540px] w-full max-w-[520px]">
            <div className="absolute left-[8%] top-8 w-[46%] rotate-[-12deg]">
              <PhoneFrame floating="slow">
                <Image src={PHONES[0].image} alt="" fill sizes="240px" className="object-cover" priority />
                <CaptionPreview hook={PHONES[0].hook} caption={PHONES[0].caption} style={PHONES[0].style} />
              </PhoneFrame>
            </div>
            <div className="absolute right-[6%] top-0 z-10 w-[50%] rotate-[8deg]">
              <PhoneFrame floating="delayed">
                <Image src={PHONES[1].image} alt="" fill sizes="260px" className="object-cover" priority />
                <CaptionPreview hook={PHONES[1].hook} caption={PHONES[1].caption} style={PHONES[1].style} />
              </PhoneFrame>
            </div>
            <div className="absolute bottom-0 left-[28%] z-20 w-[44%] rotate-[2deg]">
              <PhoneFrame>
                <Image src={PHONES[2].image} alt="" fill sizes="220px" className="object-cover" />
                <CaptionPreview hook={PHONES[2].hook} caption={PHONES[2].caption} style={PHONES[2].style} />
              </PhoneFrame>
            </div>
          </div>
        </div>
        <div className="sprocket h-3 border-y border-line" />
      </section>

      <section className="overflow-hidden border-b border-line py-4">
        <div className="marquee-track flex gap-10 text-sm uppercase tracking-[0.22em] text-mist">
          {Array.from({ length: 2 }).map((_, copy) => (
            <div key={copy} className="flex gap-10 pr-10">
              {[
                "1080×1920",
                "CRF 16 HQ cuts",
                "Burned-in captions",
                "Blur-fill 9:16",
                "Hook detection",
                "Karaoke + neon + meme",
                "TikTok · Shorts · Reels",
              ].map((item) => (
                <span key={`${copy}-${item}`}>{item}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-mist">How it works</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
          Not an editor. A machine that finds the part people send.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {STEPS.map((step) => (
            <article key={step.n} className="rounded-2xl border border-line bg-ink-2 p-6">
              <p className="text-cyan">{step.n}</p>
              <h3 className="mt-3 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 text-mist">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-line">
          <Image src="/images/hero-desk.jpg" alt="Creator desk at night" width={1600} height={1000} className="h-[420px] w-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-mist">Built for posting tonight</p>
          <h2 className="mt-3 font-display text-4xl">From a 12-minute vlog to five shorts with different lines.</h2>
          <div className="mt-8 grid gap-4">
            {FEATURES.map((feature) => (
              <article key={feature.title}>
                <h3 className="font-medium text-sand">{feature.title}</h3>
                <p className="mt-1 text-sm text-mist">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-3">
          {[
            { image: "/images/editor-dark.jpg", alt: "Person editing video on several monitors", title: "Edit on desktop", body: "Trim, restyle captions and export from any modern browser." },
            { image: "/images/vlogger-studio.jpg", alt: "Creator recording at a desk with a microphone", title: "Built for talking-head content", body: "Podcasts, vlogs and interviews cut well into short vertical clips." },
            { image: "/images/creator-neon.jpg", alt: "Creator setting up a ring light and phone", title: "Made for vertical feeds", body: "Exports are sized for TikTok, YouTube Shorts and Reels." },
          ].map((item) => (
            <figure key={item.title} className="overflow-hidden rounded-2xl border border-line bg-white">
              <Image src={item.image} alt={item.alt} width={900} height={600} className="h-44 w-full object-cover" />
              <figcaption className="p-5">
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Up to 8", "suggested clips per detection run"],
            ["16", "subtitle fonts burned into the video"],
            ["1440p", "max vertical export resolution"],
            ["Free", "no account, no card, no watermark"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-4xl font-semibold text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.18em] text-mist">Everything in one editor</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-slate-950 md:text-5xl">
          Why creators use VoltCut&apos;s shorts builder
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_FEATURES.map((item) => (
            <article key={item.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-lg">{item.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs uppercase tracking-[0.18em] text-mist">Who it&apos;s for</p>
          <h2 className="mt-3 font-display text-4xl text-slate-950">One long video, a week of content</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((item) => (
              <article key={item.title} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center font-display text-4xl text-slate-950">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-line bg-white">
          {FAQS.map((item, index) => (
            <details key={item.q} open={index === 0} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-950">
                {item.q}
                <span className="text-slate-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-mist">The VoltCut Blog</p>
              <h2 className="mt-3 font-display text-3xl text-slate-950 md:text-4xl">
                Make every frame count.
              </h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-slate-700 hover:text-slate-950 hover:underline">
              Explore all guides →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => <BlogCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl">
          <Image src="/images/videographer.jpg" alt="" width={1600} height={900} className="h-[380px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-950/20" />
          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-12">
            <h2 className="font-display text-4xl text-white md:text-6xl">Cut the part they replay.</h2>
            <p className="mt-3 max-w-xl text-slate-200">Free to use. Paste a link or drop a file and get captioned shorts in seconds.</p>
            <Link href="/studio" className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-100">
              Start a cut
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
