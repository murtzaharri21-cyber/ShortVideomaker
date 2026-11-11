import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            <span>{post.category}</span>
            <span>{post.readTime}</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold leading-snug text-slate-950 group-hover:underline">
            {post.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{post.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
            Read the guide <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
