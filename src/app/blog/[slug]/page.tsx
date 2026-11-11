import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog-card";
import { BLOG_POSTS } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — VoltCut Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image.src],
      type: "article",
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const postIndex = BLOG_POSTS.findIndex((item) => item.slug === slug);
  const post = BLOG_POSTS[postIndex];
  if (!post) notFound();

  const relatedPosts = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <main>
      <article>
        <header className="mx-auto max-w-4xl px-5 pb-10 pt-12 md:pb-14 md:pt-20">
          <Link href="/blog" className="text-sm font-semibold text-slate-600 hover:text-slate-950">
            ← All blogs
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span>{post.category}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-5 font-display text-4xl leading-[1.08] tracking-tight text-slate-950 md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">{post.description}</p>
        </header>

        <figure className="mx-auto max-w-6xl px-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={post.image.src}
              alt={post.image.alt}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
          {post.image.caption ? (
            <figcaption className="mt-3 text-center text-sm text-slate-500">{post.image.caption}</figcaption>
          ) : null}
        </figure>

        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:grid-cols-[minmax(0,1fr)_240px] md:gap-16 md:py-16">
          <div className="min-w-0">
            {post.sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.heading} className="mb-12">
                <h2 className="font-display text-2xl leading-snug text-slate-950 md:text-3xl">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 space-y-3 pl-5 text-base leading-7 text-slate-700 marker:text-blue-600">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                ) : null}
                {section.image ? (
                  <figure className="mt-7">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={section.image.src}
                        alt={section.image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 720px"
                        className="object-cover"
                      />
                    </div>
                    {section.image.caption ? (
                      <figcaption className="mt-3 text-sm text-slate-500">{section.image.caption}</figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </section>
            ))}

            <div className="rounded-2xl bg-slate-950 p-7 text-white md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Put it into practice</p>
              <h2 className="mt-3 font-display text-2xl md:text-3xl">Your next video has more in it.</h2>
              <p className="mt-3 max-w-xl leading-relaxed text-slate-300">
                Find a moment, refine the framing and captions, then export a short ready for your workflow.
              </p>
              <Link
                href="/studio"
                className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
              >
                Open the studio
              </Link>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-line bg-slate-50 p-5 md:sticky md:top-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">In this guide</p>
            <nav aria-label="Article sections" className="mt-4 space-y-3">
              {post.sections.map((section, index) => (
                <a key={section.heading} href={`#section-${index + 1}`} className="block text-sm leading-relaxed text-slate-700 hover:text-slate-950 hover:underline">
                  {section.heading}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </article>

      <section className="border-t border-line bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-slate-950">More from the blog</h2>
            <Link href="/blog" className="text-sm font-semibold text-slate-700 hover:text-slate-950 hover:underline">
              All guides
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedPosts.map((related) => <BlogCard key={related.slug} post={related} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
