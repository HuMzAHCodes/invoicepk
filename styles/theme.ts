// styles/theme.ts
// SINGLE SOURCE OF TRUTH for all colors, typography tokens, and design values.
// Every component imports from here — never hardcode hex values anywhere else.
// Theme A — Ledger palette for InvoicePK.

const theme = {

  // ─── Colors ──────────────────────────────────────────────────────────────

  colors: {

    // Primary — brand, buttons, active states
    primary: {
      50:  '#E8F0EA',
      200: '#A9C9B4',
      400: '#4B8867',
      600: '#1F5C3F',
      900: '#0F2E1F',
    },

    // Accent — used sparingly, highlights only
    accent: {
      50:  '#FBF3E6',
      200: '#E9C98C',
      400: '#CBA05A',
      600: '#B8863B',
      900: '#5C431D',
    },

    // Success — paid invoices, positive amounts
    success: {
      50:  '#EAF5EC',
      200: '#A8D9B4',
      400: '#5CB975',
      600: '#2F8F4E',
      900: '#163A22',
    },

    // Warning — draft, sent, pending
    warning: {
      50:  '#FBF1DF',
      200: '#EFCB8A',
      400: '#DE9F3E',
      600: '#B87A1E',
      900: '#5C3D0F',
    },

    // Danger — overdue, errors, delete actions
    danger: {
      50:  '#FBEAEA',
      200: '#E9A8A8',
      400: '#D66565',
      600: '#B23333',
      900: '#591919',
    },

    // Neutral — body text, borders, table rows, backgrounds
    neutral: {
      50:  '#F7F5EF',
      100: '#F0EAE0',
      200: '#DEDACB',
      400: '#A8A395',
      600: '#6E6A5D',
      900: '#2B2924',
    },

    // Surface colors
    white:   '#FFFFFF',
    surface: '#F7F5EF', // neutral-50 — page background
  },

  // ─── Typography ──────────────────────────────────────────────────────────

  fonts: {
    display: 'var(--font-display)', // Fraunces — headlines only
    body:    'var(--font-body)',    // Public Sans — all UI text
    mono:    'var(--font-mono)',    // IBM Plex Mono — numbers/amounts
  },

  fontSizes: {
    xs:   '0.75rem',   // 12px
    sm:   '0.875rem',  // 14px
    base: '1rem',      // 16px
    lg:   '1.125rem',  // 18px
    xl:   '1.25rem',   // 20px
    '2xl':'1.5rem',    // 24px
    '3xl':'1.875rem',  // 30px
    '4xl':'2.25rem',   // 36px
    '5xl':'3rem',      // 48px
    '6xl':'3.75rem',   // 60px
  },

  fontWeights: {
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
    black:    900,
  },

  // ─── Spacing ─────────────────────────────────────────────────────────────

  spacing: {
    1:  '0.25rem',
    2:  '0.5rem',
    3:  '0.75rem',
    4:  '1rem',
    5:  '1.25rem',
    6:  '1.5rem',
    8:  '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // ─── Border Radius ───────────────────────────────────────────────────────

  radius: {
    sm:   '0.25rem',
    md:   '0.5rem',
    lg:   '0.75rem',
    xl:   '1rem',
    full: '9999px',
  },

  // ─── Shadows ─────────────────────────────────────────────────────────────

  shadows: {
    sm:  '0 1px 2px 0 rgba(43, 41, 36, 0.05)',
    md:  '0 4px 6px -1px rgba(43, 41, 36, 0.08), 0 2px 4px -1px rgba(43, 41, 36, 0.04)',
    lg:  '0 10px 15px -3px rgba(43, 41, 36, 0.08), 0 4px 6px -2px rgba(43, 41, 36, 0.04)',
    xl:  '0 20px 25px -5px rgba(43, 41, 36, 0.08), 0 10px 10px -5px rgba(43, 41, 36, 0.02)',
  },

  // ─── Transitions ─────────────────────────────────────────────────────────

  transitions: {
    fast:   'all 0.15s ease',
    normal: 'all 0.25s ease',
    slow:   'all 0.4s ease',
  },

  // ─── Breakpoints ─────────────────────────────────────────────────────────

  breakpoints: {
    sm:  '640px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
    '2xl': '1536px',
  },

  // ─── Invoice Status Colors (semantic shortcuts) ───────────────────────────

  status: {
    draft: {
      bg:   '#F7F5EF',
      text: '#6E6A5D',
      border: '#DEDACB',
    },
    sent: {
      bg:   '#FBF1DF',
      text: '#B87A1E',
      border: '#EFCB8A',
    },
    paid: {
      bg:   '#EAF5EC',
      text: '#2F8F4E',
      border: '#A8D9B4',
    },
    overdue: {
      bg:   '#FBEAEA',
      text: '#B23333',
      border: '#E9A8A8',
    },
  },

  // ─── Section Banding (landing page alternating backgrounds) ──────────────

  sections: {
    light:  '#FFFFFF',        // white sections
    muted:  '#F7F5EF',        // neutral-50 sections
    cta:    '#1F5C3F',        // primary-600 — one bold CTA band only
    footer: '#0F2E1F',        // primary-900 — dark footer
  },

} as const;

export type Theme = typeof theme;
export default theme;









