// components/Navbar/index.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface NavbarProps {
  onMenuClick: () => void;
}

// ─── Breakpoints ───────────────────────────────────────────────────────────

const MOBILE_WIDTH = 768;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_WIDTH);
    }

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const displayName = user?.displayName ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  // ─── Styles ────────────────────────────────────────────────────────────

  const navbarStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "56px",
    width: "100%",
    padding: "0 1.5rem",
    backgroundColor: theme.colors.white,
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    boxSizing: "border-box",
  };

  const leftGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const hamburgerStyle: React.CSSProperties = {
    display: isMobile ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    borderRadius: theme.radius.md,
    color: theme.colors.neutral[600],
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  const wordmarkStyle: React.CSSProperties = {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.primary[600],
    textDecoration: "none",
    lineHeight: 1,
  };

  const rightGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 1,
    userSelect: "none",
  };

  const usernameStyle: React.CSSProperties = {
    display: isMobile ? "none" : "block",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral[600],
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "160px",
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <header style={navbarStyle}>
      {/* Left: hamburger (mobile) + wordmark */}
      <div style={leftGroupStyle}>
        <button
          type="button"
          style={hamburgerStyle}
          onClick={onMenuClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.neutral[50];
            e.currentTarget.style.color = theme.colors.neutral[900];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = theme.colors.neutral[600];
          }}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <Link href="/dashboard" style={wordmarkStyle}>
          InvoicePK
        </Link>
      </div>

      {/* Right: avatar + username */}
      <div style={rightGroupStyle}>
        <span style={usernameStyle}>{displayName}</span>
        <div style={avatarStyle} aria-hidden="true">
          {initial}
        </div>
      </div>
    </header>
  );
}

/*
|--------------------------------------------------------------------------
| Functionality Summary
|--------------------------------------------------------------------------
|
| File:
|   components/Navbar/index.tsx
|
| Purpose:
|   Renders the application's top navigation bar for authenticated pages.
|   Provides branding, responsive navigation controls, and authenticated
|   user information.
|
| Features:
|   - Sticky navigation bar that remains visible while scrolling.
|   - Responsive layout for desktop and mobile devices.
|   - Mobile-only hamburger menu for toggling the sidebar.
|   - Dashboard wordmark linking back to the home dashboard.
|   - Displays the authenticated user's display name.
|   - Generates a circular avatar using the user's first initial.
|
| Responsive Behaviour:
|   - Detects viewport width using the window resize event.
|   - Shows the hamburger menu only on screens smaller than 768px.
|   - Hides the username on mobile to maximize available space.
|   - Displays the full username on tablet and desktop layouts.
|
| Authentication Integration:
|   - Retrieves the authenticated user from AuthContext.
|   - Uses user.displayName when available.
|   - Falls back to "User" if no display name exists.
|   - Creates an avatar from the first character of the display name.
|
| User Interface:
|   Left Section:
|     - Mobile sidebar toggle button.
|     - InvoicePK dashboard link.
|
|   Right Section:
|     - Authenticated user's display name.
|     - Circular avatar containing the user's initial.
|
| Styling:
|   - Uses centralized theme configuration.
|   - Sticky positioning with top navigation.
|   - Consistent spacing, typography, colors, and border styling.
|   - Hover effects for the mobile menu button.
|   - Responsive typography and layout adjustments.
|
| State Management:
|   - isMobile
|       Tracks whether the current viewport is below the mobile breakpoint.
|
| Event Handling:
|   - Updates responsive state on window resize.
|   - Executes onMenuClick() when the hamburger menu is pressed.
|   - Applies hover styles to the menu button.
|
| Accessibility:
|   - Provides an accessible aria-label for the sidebar toggle button.
|   - Marks the decorative avatar as aria-hidden.
|
|--------------------------------------------------------------------------
| Git Commit
|--------------------------------------------------------------------------
| feat(navbar): implement responsive authenticated navigation with mobile
| sidebar toggle, user avatar, and dashboard branding
|--------------------------------------------------------------------------
*/
