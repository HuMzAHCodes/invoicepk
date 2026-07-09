"use client";

import Link from "next/link";
import theme from "@/styles/theme";

// ─── Styles ───

// Center nav links container
const container: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[8],
};

// ─── CSS Animation ───
const hoverCSS = `
  .nav-link {
    position: relative;
    font-family: ${theme.fonts.body};
    font-size: ${theme.fontSizes.sm};
    font-weight: ${theme.fontWeights.medium};
    color: ${theme.colors.neutral[600]};
    text-decoration: none;
    cursor: pointer;
    padding: 6px 12px;
    transition: color 0.2s ease;
    z-index: 1;
  }

  .nav-link::before,
  .nav-link::after {
    content: '';
    position: absolute;
    border: 1.5px solid ${theme.colors.primary[600]};
    border-radius: ${theme.radius.md};
    transition: none;
    pointer-events: none;
  }

  /* Bottom border — appears first */
  .nav-link::before {
    bottom: 0; left: 50%; right: 50%; height: 0;
  }
  /* Top border — appears second */
  .nav-link::after {
    top: 0; left: 50%; right: 50%; height: 0;
  }

  .nav-link-expand {
    position: absolute;
    inset: 0;
    border-left: 1.5px solid ${theme.colors.primary[600]};
    border-right: 1.5px solid ${theme.colors.primary[600]};
    border-radius: ${theme.radius.md};
    border-top: none; border-bottom: none;
    pointer-events: none;
  }

  .nav-link:hover {
    color: ${theme.colors.primary[600]};
  }

  /* Bottom line expands outward */
  .nav-link:hover::before {
    left: 0; right: 0;
    transition: left 0.15s ease 0s, right 0.15s ease 0s;
  }

  /* Sides appear */
  .nav-link:hover .nav-link-expand {
    opacity: 1;
    transition: opacity 0s ease 0.15s;
  }

  /* Top line closes the box */
  .nav-link:hover::after {
    left: 0; right: 0;
    transition: left 0.1s ease 0.15s, right 0.1s ease 0.15s;
  }

  /* ─── Reverse on leave ─── */

  /* Top line disappears first */
  .nav-link:not(:hover)::after {
    left: 50%; right: 50%;
    transition: left 0.1s ease 0s, right 0.1s ease 0s;
  }

  /* Sides disappear */
  .nav-link:not(:hover) .nav-link-expand {
    opacity: 0;
    transition: opacity 0s ease 0.1s;
  }

  /* Bottom line disappears last */
  .nav-link:not(:hover)::before {
    left: 50%; right: 50%;
    transition: left 0.15s ease 0.1s, right 0.15s ease 0.1s;
  }

  .nav-link:not(:hover) {
    color: ${theme.colors.neutral[600]};
  }
`;

// ─── Data ───
const links = [
  { label: "About Us", href: "#faq", isAnchor: true },
  { label: "How it Works", href: "#how-it-works", isAnchor: true },
  { label: "Invoices", href: "/dashboard", isAnchor: false },
];

// ─── Component ───
export default function CenterLinks() {
  return (
    <>
      <style>{hoverCSS}</style>
      <div style={container}>
        {links.map((l) =>
          l.isAnchor ? (
            <a key={l.label} href={l.href} className="nav-link">
              {l.label}
              <span className="nav-link-expand" />
            </a>
          ) : (
            <Link key={l.label} href={l.href} className="nav-link">
              {l.label}
              <span className="nav-link-expand" />
            </Link>
          )
        )}
      </div>
    </>
  );
}
