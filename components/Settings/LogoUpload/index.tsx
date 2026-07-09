"use client";

import { useState, useRef } from "react";
import { Camera, X, Upload } from "lucide-react";
import { auth } from "@/lib/firebase-client";
import theme from "@/styles/theme";

// ─── Props ───
interface LogoUploadProps {
  currentLogoUrl: string | null;
  onLogoUploaded: (url: string) => void;
}

// ─── Styles ───

// Container wrapping avatar and upload controls
const container: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[5],
};

// Avatar box that holds the logo or placeholder
const avatarWrap: React.CSSProperties = {
  position: "relative",
  width: "100px",
  height: "100px",
  borderRadius: theme.radius.xl,
  backgroundColor: theme.colors.primary[50],
  border: `2px dashed ${theme.colors.neutral[200]}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0,
};

// Logo image fill
const avatarImg: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

// Placeholder shown when no logo is set
const avatarPlaceholder: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing[1],
  color: theme.colors.neutral[400],
};

// Primary upload button
const uploadBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: theme.spacing[2],
  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
  backgroundColor: theme.colors.white,
  color: theme.colors.neutral[600],
  border: `1px solid ${theme.colors.neutral[200]}`,
  borderRadius: theme.radius.md,
  fontFamily: theme.fonts.body,
  fontSize: theme.fontSizes.sm,
  fontWeight: theme.fontWeights.medium,
  cursor: "pointer",
  transition: theme.transitions.fast,
};

// Remove logo button
const removeBtn: React.CSSProperties = {
  ...uploadBtn,
  color: theme.colors.danger[600],
  borderColor: theme.colors.danger[200],
};

// Helper text below upload controls
const hint: React.CSSProperties = {
  fontSize: theme.fontSizes.xs,
  color: theme.colors.neutral[400],
  marginTop: theme.spacing[1],
};

// Error text below upload controls
const errorText: React.CSSProperties = {
  fontSize: theme.fontSizes.xs,
  color: theme.colors.danger[600],
  marginTop: theme.spacing[1],
};

// Hidden file input
const hiddenInput: React.CSSProperties = {
  display: "none",
};

// ─── Component ───
export default function LogoUpload({
  currentLogoUrl,
  onLogoUploaded,
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const token = await auth.currentUser?.getIdToken(true);
      const res = await fetch("/api/business/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");

      onLogoUploaded(json.data.logoUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    onLogoUploaded("");
  }

  // ─── Render ───
  return (
    <div>
      <div style={container}>
        <div style={avatarWrap}>
          {currentLogoUrl ? (
            <img src={currentLogoUrl} alt="Logo" style={avatarImg} />
          ) : (
            <div style={avatarPlaceholder}>
              <Camera size={24} />
              <span style={{ fontSize: theme.fontSizes.xs }}>No logo</span>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: "flex", gap: theme.spacing[2] }}>
            <label style={uploadBtn}>
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload Logo"}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                style={hiddenInput}
                disabled={uploading}
              />
            </label>
            {currentLogoUrl && (
              <button type="button" style={removeBtn} onClick={handleRemove}>
                <X size={14} />
                Remove
              </button>
            )}
          </div>
          <div style={hint}>PNG or JPG, max 2MB. Displayed on invoices.</div>
          {error && <div style={errorText}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
