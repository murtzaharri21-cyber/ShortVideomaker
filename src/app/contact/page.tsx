import { H2, LegalPage } from "@/components/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Contact & Business Details — VoltCut" };

export default function ContactPage() {
  return (
    <LegalPage title="Contact & Business Details">
      <table>
        <tbody>
          <tr><th>Trading name</th><td>{BUSINESS.name}</td></tr>
          <tr><th>Legal entity</th><td>{BUSINESS.legalName}</td></tr>
          <tr><th>Registered address</th><td>{BUSINESS.address}</td></tr>
          <tr><th>Country</th><td>{BUSINESS.country}</td></tr>
          <tr><th>General & support</th><td><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></td></tr>
          <tr><th>Privacy & data requests</th><td><a href={`mailto:${BUSINESS.privacyEmail}`}>{BUSINESS.privacyEmail}</a></td></tr>
        </tbody>
      </table>
      <H2>Response times</H2>
      <p>Support: within 5 business days. Privacy and deletion requests: within 30 days.</p>
    </LegalPage>
  );
}
