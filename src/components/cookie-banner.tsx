"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "voltcut-consent";
type Choice = { necessary: true; analytics: boolean; date: string };

function read(): Choice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Choice;
    if (Date.now() - new Date(parsed.date).getTime() > 365 * 864e5) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!read()) setOpen(true);
    const reopen = () => {
      setAnalytics(read()?.analytics ?? false);
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener("voltcut:cookie-settings", reopen);
    return () => window.removeEventListener("voltcut:cookie-settings", reopen);
  }, []);

  function save(value: boolean) {
    localStorage.setItem(KEY, JSON.stringify({ necessary: true, analytics: value, date: new Date().toISOString() }));
    setOpen(false);
    setCustom(false);
  }

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-xl">
      <h2 id="cookie-title" className="text-base font-semibold text-slate-950">Your privacy choices</h2>
      <p className="mt-2 text-sm text-slate-700">
        We only use strictly necessary storage to run the site and remember this choice. We don’t use advertising or analytics cookies. Read our{" "}
        <Link href="/cookies" className="text-blue-700 underline">Cookie Policy</Link> and{" "}
        <Link href="/privacy" className="text-blue-700 underline">Privacy Policy</Link>.
      </p>
      {custom ? (
        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1 h-4 w-4" />
            <span><strong className="text-slate-950">Strictly necessary</strong> — always on. Remembers your consent.</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 h-4 w-4" />
            <span><strong className="text-slate-950">Analytics</strong> — currently not used. Off by default.</span>
          </label>
        </div>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => save(false)} className="rounded-xl border border-slate-900 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100">
          Reject all
        </button>
        {custom ? (
          <button type="button" onClick={() => save(analytics)} className="rounded-xl border border-slate-900 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100">
            Save choices
          </button>
        ) : (
          <button type="button" onClick={() => setCustom(true)} className="rounded-xl border border-slate-900 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100">
            Customize
          </button>
        )}
        <button type="button" onClick={() => save(true)} className="rounded-xl border border-slate-900 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-slate-100">
          Accept all
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("voltcut:cookie-settings"))}
      className={className ?? "rounded-xl border border-slate-900 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-100"}
    >
      Cookie settings
    </button>
  );
}
