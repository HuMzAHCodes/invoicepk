// components/Landing/Navbar/CenterLinks/index.tsx
"use client";

import Link from "next/link";
import theme from "@/styles/theme";
import { useCursorContext } from "@/components/CustomCursor";

// ─── Styles ────────────────────────────────────────────────────────────────

// Center nav links container
const container: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[8],
};

// ─── CSS Animation ─────────────────────────────────────────────────────────

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

  /* Single border element — clips content to border-radius */
  .nav-link::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1.5px solid ${theme.colors.primary[600]};
    border-radius: ${theme.radius.md};
    pointer-events: none;
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
    transition: clip-path 0.25s ease;
  }

  .nav-link:hover {
    color: ${theme.colors.primary[600]};
  }

  /* Expand: bottom line → full box */
  .nav-link:hover::before {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }

  /* Collapse: full box → bottom line */
  .nav-link:not(:hover)::before {
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
    transition: clip-path 0.2s ease;
  }
`;

// ─── Data ──────────────────────────────────────────────────────────────────

export const links = [
  { label: "About Us", href: "#faq", isAnchor: true },
  { label: "How it Works", href: "#how-it-works", isAnchor: true },
  { label: "Invoices", href: "/dashboard", isAnchor: false },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function CenterLinks() {
  const { smoother } = useCursorContext();

  // Handle same-page anchor navigation using GSAP ScrollSmoother
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();

    const id = href.replace("#", "");
    const target = document.getElementById(id);

    if (!target) return;

    if (smoother) {
      smoother.scrollTo(target, true, "top top");
    } else {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <style>{hoverCSS}</style>

      <div style={container}>
        {links.map((l) =>
          l.isAnchor ? (
            <a
              key={l.label}
              href={l.href}
              className="nav-link"
              onClick={(e) => handleAnchorClick(e, l.href)}
            >
              {l.label}
            </a>
          ) : (
            <Link key={l.label} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ),
        )}
      </div>
    </>
  );
}
