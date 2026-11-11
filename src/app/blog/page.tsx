import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "VoltCut Blogs — Practical Guides for Better Shorts",
  description:
    "Practical guides to vertical video framing, readable captions, and export settings for Shorts, Reels, and TikToks.",
};

export default function BlogIndexPage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-slate-950/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/20" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">The VoltCut Blog</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Practical guides for better shorts.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
            Make the frame work on a phone, keep captions easy to read, and export at a size that fits your footage.
            Straightforward advice for your next cut.
          </p>
          <Link
            href="/studio"
            className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            Make your next short
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">From the blog</p>
            <h2 className="mt-3 font-display text-3xl text-slate-950 md:text-4xl">Make every frame count.</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Editing, captions, and export choices—explained in guides you can put to work right away.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => <BlogCard key={post.slug} post={post} />)}
        </div>
      </section>
    </main>
  );
}
