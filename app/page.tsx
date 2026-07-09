// app/layout.tsx
// Root layout — applies all three fonts to <html>, sets base metadata,
// and wraps the entire app. Every page inherits from this layout.
// Font CSS variables are set here so every component can use them via
// var(--font-display), var(--font-body), var(--font-mono).

// import type { Metadata } from "next";
// import { fraunces, publicSans, plexMono } from "@/styles/fonts";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "InvoicePK — GST-Compliant Invoices for Pakistani Freelancers",
//   description:
//     "Generate FBR-compliant GST invoices in 2 minutes. Auto-calculate GST, WHT, and download professional PDFs. Built for Pakistani freelancers and agencies.",
//   keywords:
//     "invoice pakistan, GST invoice, FBR invoice, freelancer invoice pakistan, WHT invoice",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html
//       lang="en"
//       className={`
//         ${fraunces.variable}
//         ${publicSans.variable}
//         ${plexMono.variable}
//       `}
//     >
//       <body
//         style={{
//           fontFamily: "var(--font-body)",
//           backgroundColor: "#F7F5EF",
//           color: "#2B2924",
//           minHeight: "100vh",
//           margin: 0,
//         }}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }

/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   feat(layout): implement application root layout

   - Added global root layout for the Next.js application
   - Wrapped all pages with a shared layout
   - Established a consistent application structure
   - Enabled shared styling across all routes

   ---------------------------------------------------------------------------

   feat(typography): configure global font system

   - Applied display font globally
   - Applied body font globally
   - Applied monospace font globally
   - Registered font CSS variables on the root HTML element
   - Enabled font reuse through CSS custom properties

   ---------------------------------------------------------------------------

   feat(metadata): configure application metadata

   - Added default application title
   - Added SEO description
   - Added relevant search keywords
   - Established base metadata for all pages

   ---------------------------------------------------------------------------

   feat(styles): define global application styling

   - Applied default body typography
   - Configured application background color
   - Configured default text color
   - Ensured full viewport height layout
   - Reset default body margin

   ---------------------------------------------------------------------------

   feat(layout): provide application-wide inheritance

   - Enabled global font availability
   - Shared metadata across all routes
   - Ensured every page inherits the root layout configuration

============================================================================ */

import Landing from "../components/Landing";

export default function HomePage() {
  return <Landing />;
}
