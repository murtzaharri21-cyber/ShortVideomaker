import { H2, LegalPage } from "@/components/legal-page";
import { CookieSettingsButton } from "@/components/cookie-banner";

export const metadata = { title: "Cookie Policy — VoltCut" };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" intro="We use only what is strictly necessary to run the site. We do not use advertising or analytics cookies.">
      <H2>What we store</H2>
      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr></thead>
        <tbody>
          <tr><td>voltcut-consent</td><td>localStorage (strictly necessary)</td><td>Remembers your cookie choice so the banner doesn’t reappear</td><td>12 months</td></tr>
        </tbody>
      </table>
      <p>No third-party cookies are set. Fonts and images are self-hosted. If we ever add optional analytics, it will stay off until you opt in.</p>
      <H2>Change your choice</H2>
      <p>You can reopen the cookie settings at any time:</p>
      <CookieSettingsButton />
    </LegalPage>
  );
}
