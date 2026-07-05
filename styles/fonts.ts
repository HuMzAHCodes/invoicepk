// styles/fonts.ts
// Google Fonts setup via next/font/google — self-hosted automatically by Next.js.
// Three-font system for InvoicePK:
//   Fraunces   → display/headlines only
//   Public Sans → all UI text (body, buttons, forms, nav)
//   IBM Plex Mono → all numeric/currency values
// Never use Inter, Poppins, Manrope, DM Sans, or Space Grotesk anywhere.

import { Fraunces, Public_Sans, IBM_Plex_Mono } from 'next/font/google';

export const fraunces = Fraunces({
  subsets:  ['latin'],
  axes:     ['opsz'],
  weight:   ['600', '900'],
  variable: '--font-display',
  display:  'swap',
});

export const publicSans = Public_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600'],
  variable: '--font-body',
  display:  'swap',
});

export const plexMono = IBM_Plex_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-mono',
  display:  'swap',
});