// app/layout.tsx
import type { Metadata } from "next";
import { fraunces, publicSans, plexMono } from "@/styles/fonts";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvoicePK — GST-Compliant Invoices for Pakistani Freelancers",
  description:
    "Generate FBR-compliant GST invoices in 2 minutes. Auto-calculate GST, WHT, and download professional PDFs. Built for Pakistani freelancers and agencies.",
  keywords:
    "invoice pakistan, GST invoice, FBR invoice, freelancer invoice pakistan, WHT invoice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
        ${fraunces.variable}
        ${publicSans.variable}
        ${plexMono.variable}
      `}
    >
      <body
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "#F7F5EF",
          color: "#2B2924",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
