import Link from "next/link";
import type { ReactNode } from "react";
import { BUSINESS } from "@/lib/business";

export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/" className="underline underline-offset-2 hover:text-slate-950">Home</Link> / {title}
      </nav>
      <h1 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">Last updated: {BUSINESS.updated}</p>
      {intro ? <p className="mt-6 text-lg leading-relaxed text-slate-700">{intro}</p> : null}
      <div className="legal mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">{children}</div>
    </main>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="pt-4 text-xl font-semibold text-slate-950">{children}</h2>;
}
