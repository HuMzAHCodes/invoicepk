// components/ThemeToggle/index.tsx
"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import theme from "@/styles/theme";

/**
 * ThemeToggle Component
 * 
 * Provides a dynamic, responsive button to toggle between Light and Dark modes.
 * 
 * Key Features:
 * - SSR Protection: Defer rendering until component mounts on the client to avoid Next.js hydration warning mismatches.
 * - Dynamic Variable Bridge: Leverages document.documentElement data-theme updates to switch styling variables globally.
 * - Local Storage persistence: Stores theme preference so it is retained across reloads.
 * - Smooth CSS Micro-animations: Rotates and transitions icons nicely on state switch.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">("light");
  const [isHovered, setIsHovered] = useState(false);

  // Synchronize component state with document theme on mount
  useEffect(() => {
    const htmlTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
    // Defer state updates to avoid synchronous setState inside the effect body (react-hooks/set-state-in-effect)
    const timer = setTimeout(() => {
      if (htmlTheme) {
        setActiveTheme(htmlTheme);
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Perform the theme toggle operation
  const toggleTheme = () => {
    const nextTheme = activeTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setActiveTheme(nextTheme);
  };

  // Prevent server-side render mismatch by showing a blank placeholder button of exact dimensions
  if (!mounted) {
    return (
      <div 
        style={{ 
          width: "36px", 
          height: "36px", 
          display: "inline-block",
          borderRadius: theme.radius.full 
        }} 
      />
    );
  }

  // ─── Styles ────────────────────────────────────────────────────────────

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: theme.radius.full,
    border: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: isHovered ? theme.colors.neutral[100] : "transparent",
    color: isHovered ? theme.colors.neutral[900] : theme.colors.neutral[600],
    cursor: "pointer",
    transition: theme.transitions.fast,
    padding: 0,
    outline: "none",
    boxSizing: "border-box",
  };

  const iconStyle: React.CSSProperties = {
    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease",
    transform: activeTheme === "dark" ? "rotate(180deg) scale(0.95)" : "rotate(0deg) scale(1)",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Switch to ${activeTheme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${activeTheme === "light" ? "dark" : "light"} mode`}
    >
      <div style={iconStyle} className="theme-toggle-icon">
        {activeTheme === "light" ? (
          <Moon size={18} strokeWidth={2.2} />
        ) : (
          <Sun size={18} strokeWidth={2.2} />
        )}
      </div>
    </button>
  );
}
