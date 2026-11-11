import { H2, LegalPage } from "@/components/legal-page";
import { DataRequestForm } from "@/components/data-request-form";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Data Deletion Request — VoltCut" };

export default function DataRequestPage() {
  return (
    <LegalPage title="Data Deletion Request" intro={`Projects are deleted automatically after ${BUSINESS.retentionDays} days. You can delete them sooner — instantly — using the Delete button on any project, or with this form.`}>
      <H2>Delete projects now</H2>
      <p>Paste one or more project links (for example <code>/projects/1234…</code>). Matching projects, their source videos, clips and thumbnails are permanently deleted immediately.</p>
      <DataRequestForm />
      <H2>Other requests</H2>
      <p>For access, correction or any other privacy request, describe it in the form or email <a href={`mailto:${BUSINESS.privacyEmail}`}>{BUSINESS.privacyEmail}</a>. We respond within 30 days.</p>
    </LegalPage>
  );
}
