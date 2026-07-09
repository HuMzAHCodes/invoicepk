"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import { ChevronDown } from "lucide-react";
import theme from "@/styles/theme";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  isCorporate: boolean;
}

interface ClientSelectProps {
  value: string;
  onChange: (clientId: string, isCorporate: boolean) => void;
}

export default function ClientSelect({ value, onChange }: ClientSelectProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        const data = await apiGet<{ clients: Client[] }>("/clients?limit=100");
        setClients(data.clients);
      } catch {
        // silent — dropdown just stays empty
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  const selected = clients.find((c) => c.id === value);

  function handleSelect(client: Client) {
    onChange(client.id, client.isCorporate);
    setIsOpen(false);
  }

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: theme.transitions.fast,
    boxSizing: "border-box",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.lg,
    zIndex: 50,
    maxHeight: "240px",
    overflow: "auto",
  };

  const optionStyle: React.CSSProperties = {
    padding: "10px 12px",
    cursor: "pointer",
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: theme.transitions.fast,
    borderBottom: `1px solid ${theme.colors.neutral[50]}`,
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={selectStyle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary[600];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.neutral[200];
        }}
      >
        <span
          style={{
            color: selected
              ? theme.colors.neutral[900]
              : theme.colors.neutral[400],
          }}
        >
          {loading
            ? "Loading clients..."
            : selected
              ? selected.name
              : "Select a client (optional)"}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: theme.colors.neutral[400],
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </div>

      {isOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={dropdownStyle}>
            <div
              style={{
                ...optionStyle,
                color: theme.colors.neutral[400],
                fontStyle: "italic",
              }}
              onClick={() => {
                onChange("", false);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.colors.neutral[50];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              No client
            </div>
            {clients.map((client) => (
              <div
                key={client.id}
                style={{
                  ...optionStyle,
                  backgroundColor:
                    client.id === value
                      ? theme.colors.primary[50]
                      : "transparent",
                }}
                onClick={() => handleSelect(client)}
                onMouseEnter={(e) => {
                  if (client.id !== value)
                    e.currentTarget.style.backgroundColor =
                      theme.colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  if (client.id !== value)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: theme.fontWeights.medium,
                      color: theme.colors.neutral[900],
                    }}
                  >
                    {client.name}
                  </div>
                  {client.email && (
                    <div
                      style={{
                        fontSize: theme.fontSizes.xs,
                        color: theme.colors.neutral[400],
                      }}
                    >
                      {client.email}
                    </div>
                  )}
                </div>
                {client.isCorporate && (
                  <span
                    style={{
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable client selection dropdown for forms requiring optional
//   client association.
// • Retrieves available clients from the backend API when the component is
//   mounted and maintains local loading state.
// • Displays the currently selected client or an informative placeholder when
//   no client has been chosen.
// • Allows users to clear the current selection by choosing the "No client"
//   option.
// • Returns both the selected client identifier and corporate status through
//   the supplied callback, enabling parent components to apply business rules
//   such as WHT calculations.
// • Displays client email addresses and visually identifies corporate clients
//   with a dedicated status badge.
// • Supports opening and closing a custom dropdown menu, including outside-click
//   dismissal for an intuitive user experience.
// • Applies hover, selection, and dropdown animations to improve usability and
//   visual feedback during interaction.
// • Uses the centralized theme configuration to maintain consistent typography,
//   spacing, colors, borders, shadows, and transitions across the application.
// ─────────────────────────────────────────────────────────────────────────────
