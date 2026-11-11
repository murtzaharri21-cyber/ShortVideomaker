export type BlogImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  image?: BlogImage;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  image: BlogImage;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "landscape-video-to-vertical-shorts",
    title: "How to Convert Landscape Video to Vertical Shorts Without Losing the Subject",
    description:
      "Understand fit, fill, crop, and blurred backgrounds when turning a 16:9 video into a 9:16 short, with a simple framing checklist.",
    category: "Framing guide",
    readTime: "6 min read",
    image: {
      src: "/images/blog/hero-desk.jpeg",
      alt: "Video editor and phone recording setup on a desk at night",
    },
    sections: [
      {
        heading: "Start with the moment, then choose the frame",
        paragraphs: [
          "A vertical edit is a new composition, not just a smaller version of the original. Before you crop, find the speaker, gesture, product, or reaction that makes the moment worth watching. Keep that focal point in view throughout the cut.",
          "A landscape interview with one person is usually straightforward. A two-person conversation, screen recording, or wide action shot needs more care: the important subject can move from one side of the frame to the other.",
        ],
        image: {
          src: "/images/blog/landscape-editing.jpeg",
          alt: "Laptop showing a landscape video timeline and color controls",
          caption: "Review the original composition before committing to a vertical crop.",
        },
      },
      {
        heading: "Fit, fill, and blur each solve a different problem",
        paragraphs: [
          "Fit keeps the complete landscape image visible inside a vertical canvas. Nothing is cropped, but empty bands remain above and below the video. It is useful when the whole scene matters or when cropping would remove essential context.",
          "Fill enlarges the picture until the vertical canvas is covered. This uses the screen well, but the left and right edges disappear. Check that faces, text, and movement stay inside the crop for the entire clip.",
          "A blurred background gives you a full-height presentation while preserving the original wide image in the foreground. It is a good compromise for tutorials and interviews when both the speaker and on-screen details need to remain visible.",
        ],
      },
      {
        heading: "Keep the important subject inside a safe zone",
        paragraphs: [
          "Social apps place interface controls, captions, and buttons over the video. Leave breathing room near the edges, especially on the right and along the bottom. Keep faces near the center and avoid putting essential signs or screen text where platform controls will cover them.",
          "If a person moves, follow them with the crop or use a wider fit/blur treatment. A centered crop that works on the first frame can become unusable a few seconds later.",
        ],
        bullets: [
          "Check the opening, middle, and closing frames—not just the thumbnail.",
          "Keep faces, hands, products, and important text away from the outer edges.",
          "Watch the crop at phone size and with captions turned on.",
          "Use the uncropped or blurred treatment when the full scene carries the story.",
        ],
        image: {
          src: "/images/blog/captions-setup.jpeg",
          alt: "Hands positioning a smartphone in a recording rig",
        },
      },
      {
        heading: "A quick framing checklist",
        paragraphs: [
          "Preview the full clip once in its final 9:16 layout. Confirm that the subject stays visible while speaking or moving, captions do not cover the face, and the first frame makes sense without the original landscape context. Then adjust the crop before exporting.",
          "VoltCut lets you preview a proposed cut in a vertical frame and change the export treatment before you download. The framing is always yours to review and refine.",
        ],
      },
    ],
  },
  {
    slug: "caption-styles-for-talking-head-shorts",
    title: "Caption Styles for Talking-Head Shorts: Readability Before Decoration",
    description:
      "Choose a readable on-screen caption treatment for talking-head videos, from high-contrast subtitles to kinetic word highlights.",
    category: "Caption design",
    readTime: "5 min read",
    image: {
      src: "/images/blog/captions-setup.jpeg",
      alt: "Phone mounted in a filming rig, ready to record a creator",
    },
    sections: [
      {
        heading: "Make the words easy to read first",
        paragraphs: [
          "Captions help viewers follow a talking-head clip when sound is off, the room is noisy, or a speaker uses unfamiliar terms. Their first job is to make the words clear. Effects should support that job rather than compete with the speaker.",
          "Use strong contrast, a font large enough for a phone, and short lines that can be read at a glance. Keep the text away from platform controls and avoid stacking so many lines that the face disappears.",
        ],
        image: {
          src: "/images/blog/caption-impact.jpeg",
          alt: "Vertical video preview with bold high-contrast captions",
          caption: "A simple high-contrast treatment stays readable over changing footage.",
        },
      },
      {
        heading: "Match the caption treatment to the delivery",
        paragraphs: [
          "Clean subtitles suit interviews, advice, and educational clips where the viewer should focus on the speaker’s point. A boxed background helps when the shot is bright or visually busy.",
          "Karaoke-style word highlights can give fast, energetic delivery a clear rhythm. Neon accents are useful as a small visual cue, but reserve them for a hook or a key phrase instead of styling every line.",
          "There is no one style that works for every video. Start with the speaker’s pacing and the contrast in the footage, then choose the least distracting treatment that still feels intentional.",
        ],
        image: {
          src: "/images/blog/caption-neon.jpeg",
          alt: "Vertical short preview demonstrating a neon caption treatment",
        },
      },
      {
        heading: "Put captions where they do not block the story",
        paragraphs: [
          "Avoid placing text directly over a face, a product demonstration, or the details viewers need to understand the shot. Lower-third placement often works for a talking head, but the best position depends on the source framing and the social app’s interface.",
          "Keep each phrase on screen long enough to read. Break long sentences into natural chunks, and use punctuation to preserve the speaker’s meaning rather than filling the screen with a transcript.",
        ],
        bullets: [
          "Preview at actual phone size before exporting.",
          "Check contrast on both light and dark frames.",
          "Keep captions clear of faces and platform buttons.",
          "Use emphasis sparingly so important words stand out.",
        ],
        image: {
          src: "/images/blog/caption-boxed.jpeg",
          alt: "Vertical video preview showing a boxed caption treatment",
        },
      },
      {
        heading: "Proofread every line",
        paragraphs: [
          "Automated caption ideas and alternate lines are a starting point, not a substitute for review. Correct names, numbers, product terms, and punctuation before publishing. Read the captions alongside the video once to make sure the text matches what viewers can actually see and hear.",
          "In VoltCut, you can change the caption copy and style in the clip editor, then preview the final treatment before downloading.",
        ],
      },
    ],
  },
  {
    slug: "720p-vs-1080p-vs-1440p-vertical-video",
    title: "720p vs 1080p vs 1440p for Vertical Video Exports",
    description:
      "Compare 720×1280, 1080×1920, and 1440×2560 for short-form video, including file size, source detail, and practical export checks.",
    category: "Export guide",
    readTime: "5 min read",
    image: {
      src: "/images/blog/resolution-editing.jpeg",
      alt: "Laptop showing a detailed video-editing timeline",
    },
    sections: [
      {
        heading: "Resolution is only one part of picture quality",
        paragraphs: [
          "For vertical video, 720p is 720×1280, 1080p is 1080×1920, and 1440p is 1440×2560. A larger frame can preserve more detail, but it cannot restore detail that was missing from the original recording.",
          "The source resolution, focus, lighting, compression, and export settings all affect the result. A clean 1080p source usually looks better than a soft, upscaled 1440p file.",
        ],
        image: {
          src: "/images/blog/landscape-editing.jpeg",
          alt: "Video-editing timeline and preview on a laptop",
        },
      },
      {
        heading: "When each export size makes sense",
        paragraphs: [
          "720×1280 is a practical choice for quick drafts, smaller files, and lower-resolution sources. It is often enough for a simple talking-head clip viewed on a phone.",
          "1080×1920 is a reliable default for most social shorts. It balances detail, compatibility, and manageable file size when the source has enough resolution to support it.",
          "1440×2560 can preserve extra detail from a high-resolution source or give more room for later reframing. It also creates larger files and longer exports, so use it when the source and delivery workflow benefit from the extra pixels.",
        ],
      },
      {
        heading: "Choose an export based on the source and the destination",
        paragraphs: [
          "A vertical crop from a low-resolution landscape video may have far fewer usable pixels than the original dimensions suggest. Inspect the cropped subject, not just the source file label. Upscaling a small crop can make a file larger without making it sharper.",
          "Also check the platform’s current upload guidance, your network connection, and whether you need to send the file to an editor or client. A smaller file is easier to transfer; a higher-resolution export gives more flexibility when the footage can support it.",
        ],
        image: {
          src: "/images/blog/captions-setup.jpeg",
          alt: "Smartphone positioned for recording and reviewing a vertical video",
          caption: "Review the final export on the kind of screen your audience will use.",
        },
      },
      {
        heading: "Before you export",
        paragraphs: [
          "Use this short checklist to avoid an export that is technically large but visually disappointing.",
        ],
        bullets: [
          "Confirm the source has enough detail for the selected frame size.",
          "Review the vertical crop and caption placement at phone size.",
          "Watch the start and end for missing frames or awkward cuts.",
          "Choose the smallest resolution that still looks clean for your use.",
          "Open the exported file once before uploading it.",
        ],
      },
    ],
  },
];
