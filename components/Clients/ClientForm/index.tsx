"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormField from "@/components/FormField";
import theme from "@/styles/theme";

const clientFormSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  ntn: z.string().optional(),
  isCorporate: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  initialData?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    ntn?: string | null;
    isCorporate: boolean;
  };
  onSubmit: (data: ClientFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      ntn: initialData?.ntn ?? "",
      isCorporate: initialData?.isCorporate ?? false,
    },
  });

  const isCorporate = watch("isCorporate");

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

  const rowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing[4],
  };

  const btnPrimary: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    border: "none",
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  const btnSecondary: React.CSSProperties = {
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.white,
    color: theme.colors.neutral[600],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.neutral[200]}`,
    cursor: "pointer",
    transition: theme.transitions.fast,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Client Name" error={errors.name?.message} required>
        <input
          {...register("name")}
          placeholder="e.g. Acme Corp"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary[600];
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colors.neutral[200];
          }}
        />
      </FormField>

      <div style={rowStyle}>
        <FormField label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="accounts@acme.pk"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary[600];
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.neutral[200];
            }}
          />
        </FormField>
        <FormField label="Phone">
          <input
            {...register("phone")}
            placeholder="+92-300-1234567"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary[600];
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.neutral[200];
            }}
          />
        </FormField>
      </div>

      <FormField label="Address">
        <input
          {...register("address")}
          placeholder="Karachi, Pakistan"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary[600];
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colors.neutral[200];
          }}
        />
      </FormField>

      <FormField label="NTN" error={errors.ntn?.message}>
        <input
          {...register("ntn")}
          placeholder="1234567-8"
          style={{ ...inputStyle, fontFamily: theme.fonts.mono }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary[600];
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.colors.neutral[200];
          }}
        />
      </FormField>

      <div style={{ marginBottom: theme.spacing[4] }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes.sm,
            color: theme.colors.neutral[900],
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={isCorporate}
            onChange={(e) => setValue("isCorporate", e.target.checked)}
            style={{
              width: "16px",
              height: "16px",
              accentColor: theme.colors.primary[600],
            }}
          />
          Corporate Client (WHT may apply)
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: theme.spacing[3],
          paddingTop: theme.spacing[4],
          borderTop: `1px solid ${theme.colors.neutral[200]}`,
        }}
      >
        <button type="button" onClick={onCancel} style={btnSecondary}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ ...btnPrimary, opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Client"
              : "Add Client"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Provides a reusable client form for creating and updating client records.
// • Uses React Hook Form with Zod schema validation to ensure client data is
//   validated before submission.
// • Supports both create and edit workflows by automatically populating form
//   fields with existing client data when provided.
// • Collects essential client information including name, email, phone,
//   address, NTN, and corporate status.
// • Displays field-level validation messages to help users correct invalid or
//   incomplete input.
// • Highlights focused form fields to improve usability and provide clear
//   visual feedback during data entry.
// • Allows users to mark a client as corporate, enabling workflows where
//   withholding tax (WHT) may apply.
// • Exposes configurable submit and cancel actions, allowing parent components
//   to control form submission and navigation behavior.
// • Prevents duplicate submissions by disabling the submit button while the
//   save operation is in progress and displaying contextual button labels.
// • Utilizes reusable FormField components and the centralized theme system to
//   maintain consistent form layout, styling, typography, spacing, and colors
//   throughout the application.
// ─────────────────────────────────────────────────────────────────────────────
