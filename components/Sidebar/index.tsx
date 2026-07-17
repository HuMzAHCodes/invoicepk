// components/Sidebar/index.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, Users, Settings, MessageCircle, BarChart3 } from "lucide-react";
import theme from "@/styles/theme";

// ─── Types ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ─── Data ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Ask AI", href: "/assistant", icon: MessageCircle },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

// ─── Breakpoints ───────────────────────────────────────────────────────────

const TABLET_WIDTH = 768;
const DESKTOP_WIDTH = 1024;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    function checkBreakpoints() {
      const w = window.innerWidth;
      setIsTablet(w >= TABLET_WIDTH && w < DESKTOP_WIDTH);
      setIsDesktop(w >= DESKTOP_WIDTH);
    }

    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const collapsed = isTablet;

  // ─── Styles ────────────────────────────────────────────────────────────

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 40,
    display: isOpen && !isDesktop ? "block" : "none",
  };

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: collapsed ? "64px" : "240px",
    backgroundColor: theme.colors.white,
    borderRight: `1px solid ${theme.colors.neutral[200]}`,
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
    transition: theme.transitions.normal,
    fontFamily: theme.fonts.body,
    overflowX: "hidden",
    overflowY: "auto",
    transform: isDesktop
      ? "none"
      : isOpen
        ? "translateX(0)"
        : "translateX(-100%)",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingTop: "80px",
    paddingRight: collapsed ? "8px" : "12px",
    paddingBottom: "16px",
    paddingLeft: collapsed ? "8px" : "12px",
    flex: 1,
  };

  function getNavItemStyle(href: string): React.CSSProperties {
    const isActive = pathname === href || pathname.startsWith(href + "/");

    const base: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: collapsed ? "10px" : "10px 12px",
      borderRadius: theme.radius.md,
      textDecoration: "none",
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.medium,
      cursor: "pointer",
      transition: theme.transitions.fast,
      position: "relative",
      justifyContent: collapsed ? "center" : "flex-start",
      ...(isActive
        ? {
            backgroundColor: theme.colors.primary[600],
            color: theme.colors.white,
          }
        : {
            backgroundColor: "transparent",
            color: theme.colors.neutral[600],
          }),
      ...(isActive
        ? {}
        : {
            ":hover": {
              backgroundColor: theme.colors.primary[50],
              color: theme.colors.neutral[900],
            },
          }),
    };

    return base;
  }

  function getIconStyle(href: string): React.CSSProperties {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return {
      width: "20px",
      height: "20px",
      flexShrink: 0,
      color: isActive ? theme.colors.white : "inherit",
    };
  }

  const labelStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile overlay */}
      <div
        style={overlayStyle}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside style={sidebarStyle} aria-label="Sidebar navigation">
        <nav style={navStyle}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...getNavItemStyle(item.href),
                  backgroundColor: isActive
                    ? theme.colors.primary[600]
                    : undefined,
                  color: isActive ? theme.colors.white : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      theme.colors.primary[50];
                    e.currentTarget.style.color = theme.colors.neutral[900];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.colors.neutral[600];
                  }
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon style={getIconStyle(item.href)} />
                {!collapsed && <span style={labelStyle}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// Sign out
//         <div style={{ padding: collapsed ? "8px 8px 16px" : "8px 12px 16px" }}>
//           <button
//             type="button"
//             style={signOutButtonStyle}
//             onClick={signOut}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.color = theme.colors.danger[600];
//               e.currentTarget.style.backgroundColor = theme.colors.danger[50];
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.color = theme.colors.neutral[600];
//               e.currentTarget.style.backgroundColor = "transparent";
//             }}
//             title={collapsed ? "Sign out" : undefined}
//             aria-label="Sign out"
//           >
//             <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
//             {!collapsed && <span>Sign out</span>}
//           </button>
//         </div>
