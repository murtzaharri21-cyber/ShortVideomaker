import Link from "next/link";
import { H2, LegalPage } from "@/components/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Terms of Service — VoltCut" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" intro={`These terms govern your use of ${BUSINESS.name}. By using the service you agree to them.`}>
      <H2>1. Operator</H2>
      <p>{BUSINESS.legalName}, {BUSINESS.address}. Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p>
      <H2>2. Eligibility</H2>
      <p>You must be at least {BUSINESS.minAge} years old (or the age of digital consent where you live). If you are under 18 you need permission from a parent or guardian.</p>
      <H2>3. Your content and rights</H2>
      <ul>
        <li>Only upload or paste videos you own or have permission to edit and republish. You are responsible for respecting copyright, the platform’s terms (e.g. YouTube, TikTok) and the rights of people who appear in the video.</li>
        <li>You keep all rights to your content. You give us a limited licence to store and process it only to provide the service.</li>
        <li>Do not use the service for illegal, hateful, sexually exploitative, harassing or misleading content.</li>
      </ul>
      <H2>4. How the tool works</H2>
      <p>Clip suggestions, captions, hashtags and “estimated scores” are generated automatically with simple rules. They are suggestions only and do not predict or guarantee views, reach or revenue. Review every clip before you publish it.</p>
      <H2>5. Price</H2>
      <p>The service is currently free. There are no hidden fees, auto-renewals or subscriptions. If paid features are ever introduced, the full price, including taxes, will be shown before you pay, and the <Link href="/refunds">Refund Policy</Link> will apply.</p>
      <H2>6. Storage</H2>
      <p>Projects are deleted automatically after {BUSINESS.retentionDays} days. Download anything you want to keep.</p>
      <H2>7. Copyright complaints</H2>
      <p>If you believe content processed on our service infringes your rights, email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> with the project link and details. We will remove it promptly.</p>
      <H2>8. Disclaimer and liability</H2>
      <p>The service is provided “as is”. To the extent permitted by law, we are not liable for indirect or consequential losses. Nothing in these terms limits rights you have under consumer protection law.</p>
      <H2>9. Changes and law</H2>
      <p>We may update these terms and will change the date above. These terms are governed by the laws of {BUSINESS.country}, without limiting mandatory consumer protections in your country.</p>
    </LegalPage>
  );
}
