import { H2, LegalPage } from "@/components/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Refund Policy — VoltCut" };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" intro={`${BUSINESS.name} is currently free. We never charge you without a clear checkout step showing the full price.`}>
      <H2>If paid plans are introduced</H2>
      <ul>
        <li>Prices, including taxes, will be shown before you pay. No hidden fees.</li>
        <li>You can cancel at any time from your account, in as few steps as it took to sign up.</li>
        <li>You can request a full refund within 14 days of your first payment, no questions asked.</li>
        <li>Where the law of your country gives you stronger rights (for example the EU 14-day withdrawal right), those rights apply.</li>
      </ul>
      <H2>How to request a refund</H2>
      <p>Email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> with the email used at checkout. Refunds go back to the original payment method within 10 business days.</p>
    </LegalPage>
  );
}
