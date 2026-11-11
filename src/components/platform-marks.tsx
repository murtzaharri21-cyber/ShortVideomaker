import type { ReactNode } from "react";

export function PlatformMarks({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2 text-sand">
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <path d="M14.7 3v2.2c1.7.3 3 1.1 4.1 2.3-.9.9-1.9 1.6-3.2 2v3.3c2.3-.3 4.2-1.4 5.7-3.1v3.6c-1.8 1.8-4.1 3-6.9 3.4V22h-3.6v-5.2c-2.9-.3-5.5-1.7-7.1-3.9l2.8-2.1c1.1 1.6 2.7 2.7 4.3 3.1V3h3.9Z" />
      </svg>
    </div>
  );
}

export function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M14.2 3c.4 2.6 2.1 4.3 4.8 4.7v3.1c-1.6 0-3.1-.5-4.4-1.4v6.5c0 3.6-2.8 6.1-6.3 6.1S2 19.5 2 15.9c0-3.4 2.7-6 6.2-6.1v3.2c-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.7-1.2 2.7-2.9V3h3.3Z" />
    </svg>
  );
}

export function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4h0s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6ZM9.8 15.6V8.8l6.2 3.4-6.2 3.4Z" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M14 9h3V5h-3c-2.8 0-5 2.2-5 5v2H6v4h3v8h4v-8h3.2l.8-4H13v-1c0-.6.4-1 1-1Z" />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { label: string; icon: ReactNode }> = {
    tiktok: { label: "TikTok", icon: <TikTokIcon /> },
    youtube: { label: "YT Shorts", icon: <YoutubeIcon /> },
    facebook: { label: "FB Reels", icon: <FacebookIcon /> },
    instagram: { label: "IG Reels", icon: <InstagramIcon /> },
  };
  const item = map[platform] ?? map.tiktok;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-700">
      {item.icon}
      {item.label}
    </span>
  );
}
