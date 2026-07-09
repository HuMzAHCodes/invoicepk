"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import FormField from "@/components/FormField";
import theme from "@/styles/theme";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
}

interface LineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  errors?: { message?: string }[];
}

export default function LineItems({ items, onChange, errors }: LineItemsProps) {
  function updateItem(index: number, field: string, value: string | number) {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      if (
        field === "quantity" ||
        field === "unitPrice" ||
        field === "sortOrder"
      ) {
        return {
          ...item,
          [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
        };
      }
      return { ...item, [field]: String(value) };
    });
    onChange(updated);
  }

  function addItem() {
    onChange([
      ...items,
      { description: "", quantity: 1, unitPrice: 0, sortOrder: items.length },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    outline: "none",
    transition: theme.transitions.fast,
    boxSizing: "border-box",
  };

  const numInputStyle: React.CSSProperties = {
    ...inputStyle,
    fontFamily: theme.fonts.mono,
    textAlign: "right",
  };

  const removeBtnStyle: React.CSSProperties = {
    padding: "8px",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: theme.radius.md,
    cursor: items.length <= 1 ? "not-allowed" : "pointer",
    color:
      items.length <= 1 ? theme.colors.neutral[200] : theme.colors.danger[400],
    transition: theme.transitions.fast,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1fr 80px 120px 130px 40px",
          gap: "8px",
          marginBottom: "8px",
          paddingRight: "4px",
        }}
      >
        <span />
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.xs,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[400],
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Description
        </span>
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.xs,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[400],
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            textAlign: "center",
          }}
        >
          Qty
        </span>
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.xs,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[400],
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            textAlign: "right",
          }}
        >
          Unit Price
        </span>
        <span
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.xs,
            fontWeight: theme.fontWeights.semibold,
            color: theme.colors.neutral[400],
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            textAlign: "right",
          }}
        >
          Amount
        </span>
        <span />
      </div>

      {items.map((item, index) => {
        const amount = (item.quantity || 0) * (item.unitPrice || 0);
        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 1fr 80px 120px 130px 40px",
              gap: "8px",
              marginBottom: "8px",
              alignItems: "center",
            }}
          >
            <GripVertical
              size={16}
              style={{ color: theme.colors.neutral[200], cursor: "grab" }}
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              placeholder="Service or item"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary[600];
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.neutral[200];
              }}
            />
            <input
              type="number"
              value={item.quantity || ""}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
              min="1"
              style={numInputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary[600];
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.neutral[200];
              }}
            />
            <input
              type="number"
              value={item.unitPrice || ""}
              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
              min="0"
              style={numInputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary[600];
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.neutral[200];
              }}
            />
            <div
              style={{
                ...numInputStyle,
                backgroundColor: theme.colors.neutral[50],
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {amount.toLocaleString()}
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              style={removeBtnStyle}
              disabled={items.length <= 1}
              aria-label="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}

      {errors && errors.length > 0 && errors[0]?.message && (
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.danger[600],
            marginTop: "4px",
          }}
        >
          {errors[0].message}
        </p>
      )}

      <button
        type="button"
        onClick={addItem}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          backgroundColor: "transparent",
          color: theme.colors.primary[600],
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes.sm,
          fontWeight: theme.fontWeights.medium,
          border: `1px dashed ${theme.colors.primary[600]}`,
          borderRadius: theme.radius.md,
          cursor: "pointer",
          marginTop: "4px",
          transition: theme.transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.primary[50];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Plus size={16} /> Add Line Item
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable line items editor for creating and updating invoice
//   line items.
// • Allows users to dynamically add and remove invoice items while ensuring
//   at least one line item always remains.
// • Supports inline editing of item descriptions, quantities, and unit prices,
//   immediately propagating changes to the parent component.
// • Automatically converts numeric input values and maintains the correct data
//   types for invoice calculations.
// • Calculates and displays each line item's total amount in real time based
//   on the entered quantity and unit price.
// • Displays validation errors supplied by the parent form to guide users when
//   required fields or line items are invalid.
// • Includes visual drag handles to support future item reordering while
//   preserving sort order metadata.
// • Applies interactive hover and focus states to inputs and action buttons to
//   improve usability and provide clear visual feedback.
// • Uses the centralized theme configuration to ensure consistent spacing,
//   typography, colors, borders, and transitions across the invoice module.
// ─────────────────────────────────────────────────────────────────────────────
