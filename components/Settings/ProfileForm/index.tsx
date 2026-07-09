"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { apiPut } from "@/lib/api-client";
import theme from "@/styles/theme";
import { BusinessData } from "../types";
import { useToast } from "@/components/Toast";

// ─── Props ───
interface ProfileFormProps {
  business: BusinessData;
  onSaved: (updated: BusinessData) => void;
}

// ─── Helpers ───

// Highlight border on focus
const inputFocus = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >,
) => {
  e.currentTarget.style.borderColor = theme.colors.primary[600];
};

// Reset border on blur
const inputBlur = (
  e: React.FocusEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >,
) => {
  e.currentTarget.style.borderColor = theme.colors.neutral[200];
};

// ─── Styles ───

// Card wrapper for the form
const card: React.CSSProperties = {
  padding: theme.spacing[6],
  backgroundColor: theme.colors.white,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.neutral[200]}`,
  boxShadow: theme.shadows.sm,
};

// Section heading
const heading: React.CSSProperties = {
  fontFamily: theme.fonts.display,
  fontSize: theme.fontSizes.xl,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[5],
};

// Two-column grid for form fields
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing[4],
};

// Span both columns
const fullWidth: React.CSSProperties = {
  gridColumn: "1 / -1",
};

// Field label
const label: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  color: theme.colors.neutral[900],
  marginBottom: theme.spacing[1],
  display: "block",
};

// Text and number input base
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${theme.colors.neutral[200]}`,
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  color: theme.colors.neutral[900],
  backgroundColor: theme.colors.white,
  boxSizing: "border-box" as const,
  transition: theme.transitions.fast,
};

// Select dropdown base
const select: React.CSSProperties = {
  ...input,
  cursor: "pointer",
};

// Textarea with vertical resize
const textarea: React.CSSProperties = {
  ...input,
  resize: "vertical",
  minHeight: "60px",
};

// Mono font input for numeric values
const monoInput: React.CSSProperties = {
  ...input,
  fontFamily: theme.fonts.mono,
};

// Save button
const saveBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  backgroundColor: theme.colors.primary[600],
  color: theme.colors.white,
  border: "none",
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.semibold,
  cursor: "pointer",
  transition: theme.transitions.fast,
  marginTop: theme.spacing[5],
};

// Save button when loading
const saveBtnDisabled: React.CSSProperties = {
  ...saveBtn,
  opacity: 0.6,
};

// Error alert box
const errorBox: React.CSSProperties = {
  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
  backgroundColor: theme.colors.danger[50],
  border: `1px solid ${theme.colors.danger[200]}`,
  borderRadius: theme.radius.md,
  color: theme.colors.danger[600],
  fontSize: theme.fontSizes.sm,
  marginBottom: theme.spacing[4],
};

// Success alert box
const successBox: React.CSSProperties = {
  ...errorBox,
  backgroundColor: theme.colors.success[50],
  border: `1px solid ${theme.colors.success[200]}`,
  color: theme.colors.success[600],
};

// ─── Component ───
export default function ProfileForm({ business, onSaved }: ProfileFormProps) {
  const { showToast } = useToast();
  const [name, setName] = useState(business.name);
  const [ntn, setNtn] = useState(business.ntn ?? "");
  const [strn, setStrn] = useState(business.strn ?? "");
  const [address, setAddress] = useState(business.address ?? "");
  const [defaultGstRate, setDefaultGstRate] = useState(business.defaultGstRate);
  const [currency, setCurrency] = useState(business.currency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = await apiPut<BusinessData>("/business", {
        name,
        ntn: ntn || undefined,
        strn: strn || undefined,
        address: address || undefined,
        defaultGstRate,
        currency,
      });
      onSaved(data);
      setSuccess("Profile updated successfully");
      showToast("Profile updated successfully", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ───
  return (
    <form onSubmit={handleSave} style={card}>
      <div style={heading}>Business Profile</div>

      {error && <div style={errorBox}>{error}</div>}
      {success && <div style={successBox}>{success}</div>}

      <div style={grid}>
        <div>
          <label style={label}>Business Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={input}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        <div>
          <label style={label}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={select}
          >
            <option value="PKR">PKR — Pakistani Rupee</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </div>
        <div>
          <label style={label}>NTN (optional)</label>
          <input
            type="text"
            value={ntn}
            onChange={(e) => setNtn(e.target.value)}
            placeholder="1234567-8"
            style={input}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        <div>
          <label style={label}>STRN (optional)</label>
          <input
            type="text"
            value={strn}
            onChange={(e) => setStrn(e.target.value)}
            placeholder="12-00-1234-567-89"
            style={input}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        <div>
          <label style={label}>Default GST Rate (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={defaultGstRate}
            onChange={(e) => setDefaultGstRate(parseFloat(e.target.value) || 0)}
            style={monoInput}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        <div style={fullWidth}>
          <label style={label}>Address (optional)</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Business address, city, Pakistan"
            rows={2}
            style={textarea}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        style={saving ? saveBtnDisabled : saveBtn}
      >
        <Save size={16} />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable business profile form for viewing and updating company
//   information.
// • Initializes editable form fields from the supplied business profile and
//   manages all form state locally.
// • Allows users to update business details including company name, currency,
//   NTN, STRN, default GST rate, and business address.
// • Submits profile updates to the backend business API and returns the updated
//   business data through a callback so parent components can synchronize state.
// • Displays loading, success, and error feedback throughout the save process
//   to improve user experience.
// • Includes focus and blur interactions that provide visual feedback while
//   editing form fields.
// • Supports optional business information while enforcing required fields for
//   essential profile data.
// • Uses the centralized theme configuration to maintain consistent layout,
//   typography, spacing, colors, borders, shadows, and interactive styling
//   across the business profile management interface.
// ─────────────────────────────────────────────────────────────────────────────
