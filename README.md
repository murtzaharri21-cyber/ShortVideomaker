# VoltCut - AI Video Shorts Builder

VoltCut turns long-form video content into viral vertical shorts for TikTok, YouTube Shorts, Instagram Reels, and Facebook Reels.

## Features

- **Multi-Source Import**: Paste YouTube, TikTok, Facebook, Instagram links or upload video files directly.
- **Smart Clip Detection**: Windows hooks, turning points, peaks, payoffs, and CTAs rather than generic slices.
- **Dynamic Captions & Styles**: Six caption styles (Impact, Neon, Boxed, Bold, Clean, Minimal) with platform-optimized formatting.
- **Fast Local Rendering**: Powered by FFmpeg and Next.js.
- **Local / PostgreSQL Database Support**: Built with Drizzle ORM supporting PostgreSQL or lightweight embedded PGLite.

## Getting Started

### Prerequisites

- Node.js (v18+)
- FFmpeg (bundled via `ffmpeg-static` and `ffprobe-static`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/murtzaharri21-cyber/ShortVideomaker.git
   cd ShortVideomaker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database / ORM**: [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL / PGLite
- **Video Processing**: FFmpeg & yt-dlp
