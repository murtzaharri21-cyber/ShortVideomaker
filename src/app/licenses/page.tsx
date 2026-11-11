import { H2, LegalPage } from "@/components/legal-page";

export const metadata = { title: "Licenses & Third-Party Audit — VoltCut" };

const IMAGES = [
  ["creator-neon.jpg", "Ivan S", "https://www.pexels.com/photo/7676403/"],
  ["editor-dark.jpg", "Amar Preciado", "https://www.pexels.com/photo/11063292/"],
  ["vlogger-studio.jpg", "Benjamin Dominguez", "https://www.pexels.com/photo/28332700/"],
  ["videographer.jpg", "Kyle Loftus", "https://www.pexels.com/photo/8852719/"],
  ["phone-close.jpg", "Ron Lach", "https://www.pexels.com/photo/8368375/"],
  ["ring-light.jpg", "George Milton", "https://www.pexels.com/photo/6954104/"],
  ["short-1.jpg", "MART PRODUCTION", "https://www.pexels.com/photo/7482005/"],
  ["short-2.jpg", "cottonbro studio", "https://www.pexels.com/photo/6332437/"],
  ["short-3.jpg", "Ron Lach", "https://www.pexels.com/photo/8371401/"],
  ["short-4.jpg", "Mizuno K", "https://www.pexels.com/photo/13929970/"],
  ["short-5.jpg", "Ron Lach", "https://www.pexels.com/photo/8371397/"],
  ["short-6.jpg", "MART PRODUCTION", "https://www.pexels.com/photo/7481985/"],
];

const VIDEOS = [
  ["Tima Miroshnichenko", "https://www.pexels.com/video/4994156/"],
  ["Nathan J Hilton", "https://www.pexels.com/video/19058578/"],
  ["Mizuno K", "https://www.pexels.com/video/13929695/"],
  ["Anna Shvets", "https://www.pexels.com/video/6595457/"],
  ["RDNE Stock project", "https://www.pexels.com/video/8126749/"],
];

export default function LicensesPage() {
  return (
    <LegalPage title="Licenses & Third-Party Audit" intro="Every font, image, video and software package we ship, with its license, plus an audit of the third-party code that runs in your browser.">
      <H2>Third-party SDK audit (browser)</H2>
      <table>
        <thead><tr><th>Category</th><th>Result</th></tr></thead>
        <tbody>
          <tr><td>Analytics / tracking SDKs</td><td>None</td></tr>
          <tr><td>Advertising / marketing pixels</td><td>None</td></tr>
          <tr><td>Session replay / fingerprinting</td><td>None</td></tr>
          <tr><td>External fonts or CDNs</td><td>None — fonts and images are self-hosted</td></tr>
          <tr><td>Client libraries</td><td>React, Next.js (MIT)</td></tr>
        </tbody>
      </table>

      <H2>Server software</H2>
      <table>
        <thead><tr><th>Package</th><th>License</th><th>Use</th></tr></thead>
        <tbody>
          <tr><td>Next.js, React, pg</td><td>MIT</td><td>Web app and database driver</td></tr>
          <tr><td>Drizzle ORM</td><td>Apache-2.0</td><td>Database queries</td></tr>
          <tr><td>FFmpeg / ffmpeg-static / ffprobe-static</td><td>GPL / LGPL</td><td>Video processing on our own server</td></tr>
          <tr><td>yt-dlp</td><td>Unlicense (public domain)</td><td>Fetching public videos from links you paste</td></tr>
        </tbody>
      </table>

      <H2>Fonts</H2>
      <table>
        <thead><tr><th>Font</th><th>License</th></tr></thead>
        <tbody>
          <tr><td>Poppins (website text)</td><td>SIL Open Font License 1.1</td></tr>
          <tr><td>DejaVu Sans / Serif / Mono</td><td>Bitstream Vera license (free, permissive)</td></tr>
          <tr><td>Liberation Sans / Narrow / Serif / Mono</td><td>SIL Open Font License 1.1</td></tr>
          <tr><td>GNU FreeSans / FreeSerif / FreeMono</td><td>GPLv3 with font exception (embedding in output allowed)</td></tr>
          <tr><td>URW base35 (Nimbus, URW Gothic, URW Bookman)</td><td>AGPLv3 with font exception (embedding in output allowed)</td></tr>
        </tbody>
      </table>

      <H2>Photos</H2>
      <p>Licensed under the <a href="https://www.pexels.com/license/">Pexels License</a> (free for commercial use, no attribution required — credited here anyway).</p>
      <table>
        <thead><tr><th>File</th><th>Photographer</th></tr></thead>
        <tbody>
          {IMAGES.map(([file, who, url]) => (
            <tr key={file}><td>{file}</td><td><a href={url} rel="noreferrer" target="_blank">{who} on Pexels</a></td></tr>
          ))}
        </tbody>
      </table>

      <H2>Demo video footage</H2>
      <p>The sample reel combines clips under the Pexels License by:</p>
      <ul>
        {VIDEOS.map(([who, url]) => (
          <li key={url}><a href={url} rel="noreferrer" target="_blank">{who}</a></li>
        ))}
      </ul>

      <H2>Generated artwork</H2>
      <p>The logo mark, social sharing image (og.jpg) and creator desk illustration (hero-desk.jpg) were created for VoltCut with an AI image generator and contain no third-party logos or likenesses.</p>
    </LegalPage>
  );
}
