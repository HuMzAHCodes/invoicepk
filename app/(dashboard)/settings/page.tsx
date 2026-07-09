"use client";

import Settings from "@/components/Settings";

export default function SettingsPage() {
  return <Settings />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Defines the business settings page using the App Router.
// • Configures page metadata to provide a descriptive browser title for the
//   settings section.
// • Serves as a lightweight route wrapper that renders the reusable Settings
//   component.
// • Delegates all business profile retrieval, logo management, and profile
//   editing functionality to the dedicated Settings component.
// • Keeps routing concerns separate from business logic, improving component
//   organization and maintainability.
// ─────────────────────────────────────────────────────────────────────────────
