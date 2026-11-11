"use client";

import { cn } from "@/lib/utils";

export function CaptionPreview({
  hook,
  caption,
  style = "impact",
  fontFamily,
  className,
}: {
  hook: string;
  caption: string;
  style?: string;
  fontFamily?: string;
  className?: string;
}) {
  const words = caption.split(/\s+/).filter(Boolean);
  return (
    <div className={cn("caption-layer", `style-${style}`, className)} style={fontFamily ? { fontFamily } : undefined}>
      {hook ? <span className="caption-hook">{hook}</span> : null}
      {style === "karaoke" ? (
        <span className="caption-body word-pop">
          {words.map((word, index) => (
            <span key={`${word}-${index}`}>{word} </span>
          ))}
        </span>
      ) : (
        <span className="caption-body">{caption}</span>
      )}
    </div>
  );
}
