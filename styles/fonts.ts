// styles/fonts.ts
import { Fraunces, Public_Sans, IBM_Plex_Mono } from 'next/font/google';

export const fraunces = Fraunces({
  subsets:  ['latin'],
  axes:     ['opsz'],
  weight:   'variable',   // ← must be 'variable' when using axes
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