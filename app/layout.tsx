// app/layout.tsx
import type { Metadata } from "next";
import { fraunces, publicSans, plexMono } from "@/styles/fonts";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/Toast";
import theme from "@/styles/theme";
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
      suppressHydrationWarning
      className={`
        ${fraunces.variable}
        ${publicSans.variable}
        ${plexMono.variable}
      `}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const currentTheme = savedTheme === 'dark' ? 'dark' : 'light';
                  document.documentElement.setAttribute('data-theme', currentTheme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: theme.colors.surface,
          color: theme.colors.neutral[900],
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Defines the application's root layout shared across all routes.
// • Configures global metadata, including the page title, description, and
//   SEO keywords for improved search engine visibility.
// • Registers and applies the application's custom font families through CSS
//   variables, making them available throughout the project.
// • Establishes global body styling, including typography, background color,
//   text color, minimum viewport height, and default margin reset.
// • Wraps the application with the ToastProvider, enabling application-wide
//   toast notifications.
// • Wraps the application with the AuthProvider, providing authentication
//   context and user state to all components.
// • Renders all page content through the shared layout, ensuring consistent
//   styling and provider availability across the application.
// ─────────────────────────────────────────────────────────────────────────────
