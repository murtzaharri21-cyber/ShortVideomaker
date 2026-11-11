import { H2, LegalPage } from "@/components/legal-page";
import { BUSINESS } from "@/lib/business";

export const metadata = { title: "Accessibility Statement — VoltCut" };

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" intro="We aim to meet WCAG 2.2 level AA.">
      <H2>What we do</H2>
      <ul>
        <li>Text and buttons meet a contrast ratio of at least 4.5:1 (3:1 for large text).</li>
        <li>All controls are native buttons, links and form fields, reachable with Tab and activated with Enter or Space, with a visible focus outline.</li>
        <li>A “Skip to content” link appears as the first Tab stop.</li>
        <li>Informative images have alt text; decorative images are hidden from screen readers.</li>
        <li>Animations are disabled when your system requests reduced motion.</li>
        <li>Captions can be burned into every exported clip, and 16 fonts and 6 caption styles are available for legibility.</li>
      </ul>
      <H2>Known limitations</H2>
      <ul>
        <li>The trim sliders work with arrow keys but give limited spoken feedback in some screen readers.</li>
        <li>Video previews are muted and do not include audio descriptions.</li>
      </ul>
      <H2>Feedback</H2>
      <p>If something is hard to use, email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. We reply within 5 business days.</p>
    </LegalPage>
  );
}
