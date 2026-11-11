import { H2, LegalPage } from "@/components/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Unsubscribe — VoltCut" };

export default function UnsubscribePage() {
  return (
    <LegalPage title="Email preferences" intro="VoltCut does not send marketing or newsletter emails, and we never add you to a mailing list.">
      <H2>Emails you might receive</H2>
      <p>Only a direct reply to a support or data deletion request you sent us. Every email we send includes a link to this page.</p>
      <H2>Opt out</H2>
      <p>To make sure we never email you, send a blank message to{" "}
        <a href={`mailto:${BUSINESS.email}?subject=Unsubscribe`}>{BUSINESS.email}</a> with the subject “Unsubscribe”. We act on it within 2 business days and keep only your address on a do-not-contact list.</p>
    </LegalPage>
  );
}
