"use client";

import { useEffect, useRef } from "react";
import { CaptionPreview } from "@/components/caption-preview";
import { PhoneFrame } from "@/components/phone-frame";

export function SegmentPlayer({
  src,
  start,
  end,
  poster,
  hook,
  caption,
  style,
  autoPlay = true,
  className,
}: {
  src: string;
  start: number;
  end: number;
  poster?: string;
  hook: string;
  caption: string;
  style: string;
  autoPlay?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const onLoaded = () => {
      video.currentTime = start;
      if (autoPlay) video.play().catch(() => undefined);
    };
    const onTime = () => {
      if (video.currentTime >= end - 0.05 || video.currentTime < start - 0.2) {
        video.currentTime = start;
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    if (video.readyState >= 1) onLoaded();
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [src, start, end, autoPlay]);

  return (
    <PhoneFrame className={className}>
      {src ? (
        <video
          ref={ref}
          src={`${src}#t=${start},${end}`}
          poster={poster}
          muted
          playsInline
          loop
          className="h-full w-full object-cover"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-sm text-mist">No preview</div>
      )}
      <CaptionPreview hook={hook} caption={caption} style={style} />
    </PhoneFrame>
  );
}
