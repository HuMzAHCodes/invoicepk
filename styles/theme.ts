// styles/theme.ts
// SINGLE SOURCE OF TRUTH for all colors, typography tokens, and design values.
// Every component imports from here — never hardcode hex values anywhere else.
// Theme A — Ledger palette for InvoicePK.

const theme = {

  // ─── Colors ──────────────────────────────────────────────────────────────

  colors: {

    // Primary — brand, buttons, active states
    primary: {
      50:  'var(--primary-50)',
      200: 'var(--primary-200)',
      400: 'var(--primary-400)',
      600: 'var(--primary-600)',
      900: 'var(--primary-900)',
    },

    // Accent — used sparingly, highlights only
    accent: {
      50:  'var(--accent-50)',
      200: 'var(--accent-200)',
      400: 'var(--accent-400)',
      600: 'var(--accent-600)',
      900: 'var(--accent-900)',
    },

    // Success — paid invoices, positive amounts
    success: {
      50:  'var(--success-50)',
      200: 'var(--success-200)',
      400: 'var(--success-400)',
      600: 'var(--success-600)',
      900: 'var(--success-900)',
    },

    // Warning — draft, sent, pending
    warning: {
      50:  'var(--warning-50)',
      200: 'var(--warning-200)',
      400: 'var(--warning-400)',
      600: 'var(--warning-600)',
      900: 'var(--warning-900)',
    },

    // Danger — overdue, errors, delete actions
    danger: {
      50:  'var(--danger-50)',
      200: 'var(--danger-200)',
      400: 'var(--danger-400)',
      600: 'var(--danger-600)',
      900: 'var(--danger-900)',
    },

    // Neutral — body text, borders, table rows, backgrounds
    neutral: {
      50:  'var(--neutral-50)',
      100: 'var(--neutral-100)',
      200: 'var(--neutral-200)',
      400: 'var(--neutral-400)',
      600: 'var(--neutral-600)',
      900: 'var(--neutral-900)',
    },

    // Surface colors
    white:   'var(--white)',
    surface: 'var(--surface)', // neutral-50 — page background
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
      bg:   'var(--status-draft-bg)',
      text: 'var(--status-draft-text)',
      border: 'var(--status-draft-border)',
    },
    sent: {
      bg:   'var(--status-sent-bg)',
      text: 'var(--status-sent-text)',
      border: 'var(--status-sent-border)',
    },
    paid: {
      bg:   'var(--status-paid-bg)',
      text: 'var(--status-paid-text)',
      border: 'var(--status-paid-border)',
    },
    overdue: {
      bg:   'var(--status-overdue-bg)',
      text: 'var(--status-overdue-text)',
      border: 'var(--status-overdue-border)',
    },
  },

  // ─── Section Banding (landing page alternating backgrounds) ──────────────

  sections: {
    light:  'var(--sections-light)',        // white sections
    muted:  'var(--sections-muted)',        // neutral-50 sections
    cta:    'var(--sections-cta)',          // primary-600 — one bold CTA band only
    footer: 'var(--sections-footer)',       // primary-900 — dark footer
  },

} as const;

export type Theme = typeof theme;
export default theme;









