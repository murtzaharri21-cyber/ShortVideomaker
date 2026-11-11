import Link from "next/link";
import { H2, LegalPage } from "@/components/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Privacy Policy — VoltCut" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" intro={`${BUSINESS.name} is designed to collect as little personal data as possible. You do not need an account, and we do not ask for your name, email or payment details to use the tool.`}>
      <H2>1. Who we are</H2>
      <p>{BUSINESS.legalName}, {BUSINESS.address} (“we”, “us”). Contact: <a href={`mailto:${BUSINESS.privacyEmail}`}>{BUSINESS.privacyEmail}</a>.</p>

      <H2>2. What we collect and why</H2>
      <table>
        <thead><tr><th>Data</th><th>Purpose</th><th>Legal basis</th><th>Kept for</th></tr></thead>
        <tbody>
          <tr><td>Videos you upload or links you paste, and the clips, thumbnails and captions we create from them</td><td>To provide the clipping service you request</td><td>Contract / your request</td><td>Deleted automatically after {BUSINESS.retentionDays} days, or immediately when you delete the project</td></tr>
          <tr><td>Project settings (title, vibe, clip length, fonts, resolution)</td><td>To save your edits</td><td>Contract</td><td>Same as above</td></tr>
          <tr><td>Your cookie choice (stored in your browser’s localStorage, not sent to us)</td><td>To remember your consent</td><td>Legal obligation</td><td>Until you clear it or change it</td></tr>
          <tr><td>Data deletion requests (optional email, project IDs, message)</td><td>To process and evidence your request</td><td>Legal obligation</td><td>Up to 12 months</td></tr>
          <tr><td>Basic server logs (IP address, time, URL) kept by our hosting provider</td><td>Security and abuse prevention</td><td>Legitimate interest</td><td>Up to 30 days</td></tr>
        </tbody>
      </table>
      <p>We do <strong>not</strong> use advertising cookies, analytics trackers, tracking pixels, fingerprinting or third-party marketing SDKs. We do not sell or share personal data.</p>

      <H2>3. Third parties and services we use</H2>
      <ul>
        <li><strong>Hosting provider</strong>: runs the servers and database where projects are stored.</li>
        <li><strong>Source platforms</strong> (e.g. YouTube, TikTok, Facebook): when you paste a link, our server requests that public video and its public title or thumbnail from that platform. Their own privacy policies apply to that request.</li>
        <li><strong>Open-source software</strong> running on our own server (FFmpeg, yt-dlp): processes your video locally and sends no data to third parties.</li>
        <li><strong>Fonts</strong>: Poppins is self-hosted at build time, so your browser makes no requests to Google.</li>
      </ul>
      <p>See our <Link href="/licenses">Licenses &amp; third-party audit</Link> for the full list.</p>

      <H2>4. Children</H2>
      <p>The service is not intended for children under {BUSINESS.minAge}. You must confirm you are at least {BUSINESS.minAge} (or the age of digital consent in your country, if higher) before creating clips. Users under 18 should have a parent or guardian’s permission. We do not knowingly collect data from children; if you believe a child has used the service, contact us and we will delete the data.</p>

      <H2>5. Your rights</H2>
      <p>Depending on where you live (for example under the GDPR, UK GDPR or CCPA/CPRA), you may have the right to access, correct, delete, restrict or object to processing of your data, to data portability, and to complain to your data protection authority. Because we hold no accounts, the fastest way is to delete a project directly from its page, or use our <Link href="/data-request">data deletion request form</Link>. We respond within 30 days.</p>

      <H2>6. Emails</H2>
      <p>We do not send marketing emails. If you give us an email for a deletion request we use it only to reply to that request. Any future email will include an unsubscribe link; you can also opt out at <Link href="/unsubscribe">/unsubscribe</Link>.</p>

      <H2>7. Security and transfers</H2>
      <p>Files are stored on our server and served only through unguessable project links. Data may be processed in the country where our hosting provider operates; where required we rely on appropriate safeguards such as Standard Contractual Clauses.</p>

      <H2>8. Changes</H2>
      <p>We will update the date above and highlight significant changes on the home page.</p>
    </LegalPage>
  );
}
