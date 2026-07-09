// app/(dashboard)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import theme from "@/styles/theme";

// ─── Breakpoints ───────────────────────────────────────────────────────────

const MOBILE_WIDTH = 768;
const DESKTOP_WIDTH = 1024;

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function check() {
      const w = window.innerWidth;
      setIsMobile(w < MOBILE_WIDTH);
      setIsDesktop(w >= DESKTOP_WIDTH);
    }

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // ─── Sidebar width for main content margin ──────────────────────────────

  const sidebarWidth = isDesktop ? "240px" : !isMobile ? "64px" : "0px";

  // ─── Styles ────────────────────────────────────────────────────────────

  const bodyStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: theme.colors.neutral[50],
    fontFamily: theme.fonts.body,
  };

  const mainStyle: React.CSSProperties = {
    marginLeft: sidebarWidth,
    padding: theme.spacing[8],
    boxSizing: "border-box",
    minHeight: "calc(100vh - 56px)",
  };

  return (
    <div style={bodyStyle}>
      <Navbar onMenuClick={handleMenuClick} />

      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          style={mainStyle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Functionality Summary
|--------------------------------------------------------------------------
|
| File:
|   app/(dashboard)/layout.tsx
|
| Purpose:
|   Serves as the shared layout for all authenticated dashboard pages by
|   providing a consistent application shell with a responsive Navbar,
|   Sidebar, and animated page transitions.
|
| Layout Structure:
|   - Sticky top navigation bar.
|   - Responsive sidebar navigation.
|   - Main content area for nested dashboard pages.
|   - Shared styling across all dashboard routes.
|
| Responsive Behaviour:
|   - Detects viewport size using window resize events.
|   - Mobile (<768px):
|       • Sidebar is hidden by default.
|       • Opens as an overlay when the menu button is pressed.
|
|   - Tablet (768px–1023px):
|       • Displays a compact sidebar.
|       • Adjusts main content margin accordingly.
|
|   - Desktop (≥1024px):
|       • Displays the full sidebar permanently.
|       • Main content is offset by the full sidebar width.
|
| Sidebar Management:
|   - Opens and closes via the Navbar hamburger menu.
|   - Allows closing through Sidebar callbacks.
|   - Dynamically calculates content spacing based on sidebar width.
|
| Page Transitions:
|   - Uses Framer Motion for route animations.
|   - AnimatePresence ensures smooth exit and entry transitions.
|   - Animates opacity and vertical movement between pages.
|   - Uses the current pathname as the animation key.
|
| State Management:
|   - sidebarOpen
|       Controls the visibility of the mobile sidebar.
|
|   - isMobile
|       Indicates whether the viewport is below the mobile breakpoint.
|
|   - isDesktop
|       Indicates whether the viewport is at or above the desktop breakpoint.
|
| Styling:
|   - Uses the centralized theme configuration.
|   - Full viewport height layout.
|   - Responsive content spacing.
|   - Dynamic left margin based on sidebar width.
|   - Neutral dashboard background.
|
| Components Used:
|   - Navbar
|   - Sidebar
|   - AnimatePresence
|   - motion.main
|
| Event Handling:
|   - Updates responsive layout on window resize.
|   - Toggles sidebar visibility from the Navbar.
|   - Closes the sidebar when requested by the Sidebar component.
|
|--------------------------------------------------------------------------
| Git Commit
|--------------------------------------------------------------------------
| feat(layout): implement responsive dashboard layout with animated page
| transitions, adaptive sidebar, and shared navigation
|--------------------------------------------------------------------------
*/
