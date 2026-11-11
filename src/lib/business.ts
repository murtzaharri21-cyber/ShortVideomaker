// Fill these in via environment variables before going live.
export const BUSINESS = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "VoltCut",
  legalName: process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME || "VoltCut (operator legal name to be confirmed)",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "Registered address to be published by the operator",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@voltcut.app",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "privacy@voltcut.app",
  country: process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || "To be confirmed",
  updated: "30 October 2026",
  retentionDays: 7,
  minAge: 13,
};
