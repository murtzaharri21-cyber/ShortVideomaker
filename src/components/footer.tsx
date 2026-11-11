import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-banner";
import { BUSINESS } from "@/lib/business";

const COLS = [
  { title: "Product", links: [["Studio", "/studio"], ["My clips", "/library"], ["Blogs", "/blog"], ["How it works", "/#how"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Refund Policy", "/refunds"], ["Cookie Policy", "/cookies"]] },
  { title: "Your data", links: [["Data deletion request", "/data-request"], ["Email preferences", "/unsubscribe"], ["Accessibility", "/accessibility"], ["Licenses & credits", "/licenses"]] },
  { title: "Company", links: [["Contact & business details", "/contact"]] },
];

export function Footer() {
  return (
    <footer className="mx-auto max-w-[1500px] border-t border-line px-3 py-16 md:px-12">
      <p className="text-center text-lg leading-relaxed text-slate-700">
        Made with <span aria-label="love">♥</span> for creators who post every day
      </p>
      <div className="mt-14 grid gap-10 text-left text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-1.5 text-sm">
            <span className="mb-2 font-semibold text-slate-950">{col.title}</span>
            {col.links.map(([label, href]) => (
              <Link key={href} href={href} className="text-slate-600 hover:text-slate-950 hover:underline">
                {label}
              </Link>
            ))}
            {col.title === "Company" ? (
              <div className="mt-2 space-y-1 text-slate-600">
                <p>{BUSINESS.legalName}</p>
                <p>{BUSINESS.address}</p>
                <a href={`mailto:${BUSINESS.email}`} className="text-slate-700 underline">{BUSINESS.email}</a>
              </div>
            ) : null}
          </nav>
        ))}
      </div>
      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-slate-600 sm:flex-row">
        <p>© {new Date().getFullYear()} {BUSINESS.name}. Free to use — no hidden fees. Not affiliated with YouTube, TikTok, Meta or Instagram.</p>
        <CookieSettingsButton className="rounded-lg px-2 py-1 text-xs font-medium text-slate-700 underline hover:bg-slate-100" />
      </div>
    </footer>
  );
}
