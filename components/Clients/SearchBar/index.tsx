"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import theme from "@/styles/theme";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search clients...",
}: SearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div style={{ position: "relative", maxWidth: "320px" }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.colors.neutral[400],
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px 10px 36px",
          border: `1px solid ${theme.colors.neutral[200]}`,
          borderRadius: theme.radius.md,
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.sm,
          color: theme.colors.neutral[900],
          backgroundColor: theme.colors.white,
          outline: "none",
          transition: theme.transitions.fast,
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary[600];
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.neutral[200];
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable search input component for filtering application data.
// • Maintains the current search query using local React state.
// • Debounces user input before invoking the supplied search callback,
//   reducing unnecessary searches and improving performance.
// • Supports customizable placeholder text for use across different pages and
//   search contexts.
// • Displays a search icon within the input field to provide a familiar and
//   intuitive search interface.
// • Applies visual focus styling to improve accessibility and indicate active
//   user interaction.
// • Encapsulates search behavior into a reusable component, promoting
//   consistency across client, invoice, and other searchable lists.
// • Uses the centralized theme configuration for consistent typography,
//   colors, spacing, borders, and transitions throughout the application.
// ─────────────────────────────────────────────────────────────────────────────
