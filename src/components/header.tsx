"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/library", label: "Library" },
  { href: "/blog", label: "Blogs" },
  { href: "/#how", label: "How it works" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto grid h-full max-w-[1500px] grid-cols-[1fr_auto] items-center gap-3 px-3 md:grid-cols-[1fr_auto_1fr] xl:px-12">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-mark.png" alt="VoltCut" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-semibold tracking-tight text-sand">VoltCut</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-[10px] px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                (pathname === link.href || (link.href === "/blog" && pathname.startsWith("/blog/"))) &&
                  "bg-slate-100 text-slate-950",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center justify-end gap-2 md:flex">
          <Link href="/library" className="rounded-[10px] border border-line px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
            My clips
          </Link>
          <Link href="/studio" className="rounded-[10px] bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Get clips in 1 click
          </Link>
        </div>
        <button
          type="button"
          aria-label="Menu"
          className="justify-self-end rounded-[10px] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>
      {open ? (
        <div className="border-b border-line bg-white px-3 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium text-slate-900">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-[10px] px-3 py-2 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
            <Link href="/studio" onClick={() => setOpen(false)} className="mt-1 rounded-[10px] bg-slate-950 px-3 py-2 text-center text-white">
              Get clips in 1 click
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
