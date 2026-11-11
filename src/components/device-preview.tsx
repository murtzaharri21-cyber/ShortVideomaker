"use client";

import { useEffect, useRef, useState } from "react";
import { CaptionPreview } from "@/components/caption-preview";
import { cn } from "@/lib/utils";

export const DEVICES = [
  { id: "phone", label: "Phone", ratio: "9 / 16", size: "1080×1920" },
  { id: "tablet", label: "Tablet", ratio: "3 / 4", size: "1536×2048" },
  { id: "laptop", label: "Laptop", ratio: "16 / 10", size: "1440×900" },
  { id: "desktop", label: "Desktop", ratio: "16 / 9", size: "1920×1080" },
] as const;

export type DeviceId = (typeof DEVICES)[number]["id"];
type Fit = "blur" | "fill" | "fit";

export function DevicePreview({
  src,
  poster,
  start,
  end,
  hook,
  caption,
  style,
  fontFamily,
}: {
  src: string;
  poster?: string;
  start: number;
  end: number;
  hook: string;
  caption: string;
  style: string;
  fontFamily?: string;
}) {
  const [device, setDevice] = useState<DeviceId>("phone");
  const [fit, setFit] = useState<Fit>("blur");
  const mainRef = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLVideoElement>(null);
  const meta = DEVICES.find((item) => item.id === device) ?? DEVICES[0];

  useEffect(() => {
    const videos = [mainRef.current, bgRef.current].filter(Boolean) as HTMLVideoElement[];
    const cleanups = videos.map((video) => {
      const onLoaded = () => {
        video.currentTime = start;
        video.play().catch(() => undefined);
      };
      const onTime = () => {
        if (video.currentTime >= end - 0.05 || video.currentTime < start - 0.3) video.currentTime = start;
      };
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("timeupdate", onTime);
      if (video.readyState >= 1) onLoaded();
      return () => {
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("timeupdate", onTime);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [src, start, end, device, fit]);

  const screen = (
    <div className="device-screen" style={{ aspectRatio: meta.ratio }}>
      {fit === "blur" ? (
        <video ref={bgRef} src={src} muted playsInline loop className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-75" />
      ) : null}
      <video
        ref={mainRef}
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        className={cn("relative h-full w-full", fit === "fill" ? "object-cover" : "object-contain")}
      />
      <CaptionPreview
        hook={hook}
        caption={caption}
        style={style}
        fontFamily={fontFamily}
        className={device === "laptop" || device === "desktop" ? "caption-wide" : undefined}
      />
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
        {DEVICES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDevice(item.id)}
            className={cn(
              "flex-1 rounded-xl px-3 py-1.5 text-xs",
              device === item.id ? "bg-sand text-ink" : "text-mist hover:text-sand",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex min-h-[340px] items-center justify-center">
        {device === "phone" ? (
          <div className="device-phone w-full max-w-[260px]">
            <div className="device-notch" />
            {screen}
          </div>
        ) : device === "tablet" ? (
          <div className="device-tablet w-full max-w-[320px]">{screen}</div>
        ) : device === "laptop" ? (
          <div className="w-full">
            <div className="device-laptop-lid">
              <div className="device-cam" />
              {screen}
            </div>
            <div className="device-laptop-base" />
          </div>
        ) : (
          <div className="w-full">
            <div className="device-monitor">{screen}</div>
            <div className="device-stand" />
            <div className="device-foot" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-mist">
          {meta.label} · {meta.ratio.replace(/ /g, "")} · {meta.size}
        </span>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {(["blur", "fill", "fit"] as Fit[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFit(item)}
              className={cn(
                "rounded-xl px-2.5 py-1 text-[11px] capitalize",
                fit === item ? "bg-cyan text-white" : "text-mist",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
