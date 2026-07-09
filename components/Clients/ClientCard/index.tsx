import { Edit, Trash2, Building2, User } from "lucide-react";
import theme from "@/styles/theme";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    ntn?: string | null;
    isCorporate: boolean;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClientCard({
  client,
  onEdit,
  onDelete,
}: ClientCardProps) {
  const iconStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: theme.radius.full,
    backgroundColor: client.isCorporate
      ? theme.colors.primary[50]
      : theme.colors.neutral[50],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const actionBtnStyle: React.CSSProperties = {
    padding: "6px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: theme.radius.md,
    cursor: "pointer",
    color: theme.colors.neutral[400],
    transition: theme.transitions.fast,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.white,
        border: `1px solid ${theme.colors.neutral[200]}`,
        borderRadius: theme.radius.lg,
        padding: theme.spacing[4],
        display: "flex",
        alignItems: "flex-start",
        gap: theme.spacing[4],
        transition: theme.transitions.fast,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={iconStyle}>
        {client.isCorporate ? (
          <Building2 size={20} style={{ color: theme.colors.primary[600] }} />
        ) : (
          <User size={20} style={{ color: theme.colors.neutral[600] }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.base,
              fontWeight: theme.fontWeights.semibold,
              color: theme.colors.neutral[900],
            }}
          >
            {client.name}
          </span>
          {client.isCorporate && (
            <span
              style={{
                fontFamily: theme.fonts.body,
                fontSize: "10px",
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.primary[600],
                backgroundColor: theme.colors.primary[50],
                padding: "2px 6px",
                borderRadius: theme.radius.full,
              }}
            >
              Corporate
            </span>
          )}
        </div>
        {client.email && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.neutral[600],
              margin: "0 0 2px",
            }}
          >
            {client.email}
          </p>
        )}
        {client.phone && (
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.neutral[400],
              margin: "0 0 2px",
            }}
          >
            {client.phone}
          </p>
        )}
        {client.ntn && (
          <p
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSizes.xs,
              color: theme.colors.neutral[400],
              margin: 0,
            }}
          >
            NTN: {client.ntn}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onEdit(client.id)}
          style={actionBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.primary[600];
            e.currentTarget.style.backgroundColor = theme.colors.primary[50];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.neutral[400];
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label={`Edit ${client.name}`}
        >
          <Edit size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(client.id)}
          style={actionBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.danger[600];
            e.currentTarget.style.backgroundColor = theme.colors.danger[50];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.neutral[400];
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label={`Delete ${client.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Renders a reusable client card displaying key client information in a
//   clean, responsive card layout.
// • Visually distinguishes corporate and individual clients using dedicated
//   icons, colors, and a corporate status badge.
// • Displays available client details including name, email, phone number,
//   and NTN while gracefully omitting missing information.
// • Provides edit and delete action buttons, invoking parent-supplied callback
//   functions with the selected client's identifier.
// • Includes interactive hover effects for both the card and action buttons to
//   improve visual feedback and user experience.
// • Applies accessible aria-labels to action buttons, improving usability for
//   screen readers and assistive technologies.
// • Encapsulates client presentation and interaction logic into a reusable
//   component suitable for client management pages.
// • Uses the centralized theme configuration to ensure consistent typography,
//   spacing, colors, borders, shadows, and transition effects throughout the
//   application.
// ─────────────────────────────────────────────────────────────────────────────
