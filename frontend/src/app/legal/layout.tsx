import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Authorities Portal - Environmental Monitoring",
  description:
    "Secure access portal for legal authorities and law enforcement to monitor environmental compliance and violations.",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
