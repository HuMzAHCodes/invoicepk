"use client";

import { useCallback, useState } from "react";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { apiPost } from "@/lib/api-client";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useToast } from "@/components/Toast";
import theme from "@/styles/theme";

export interface InvoiceDraftResult {
  clientId: string | null;
  clientName: string | null;
  clientMatched: boolean;
  isCorporate: boolean;
  issueDate: string;
  dueDate: string | null;
  currency: "PKR" | "USD";
  gstType: "standard" | "zero_rated" | "exempt";
  gstRate: number;
  whtApplicable: boolean;
  whtRate: number;
  notes: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    sortOrder: number;
  }>;
}

interface DescribeAssistantProps {
  onApply: (draft: InvoiceDraftResult) => void;
}

export default function DescribeAssistant({ onApply }: DescribeAssistantProps) {
  const { showToast } = useToast();
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const appendTranscript = useCallback((chunk: string) => {
    setDescription((prev) => {
      const next = prev.trim() ? `${prev.trim()} ${chunk}` : chunk;
      return next;
    });
  }, []);

  const { isListening, supported, toggle } = useSpeechToText(appendTranscript);

  async function handleAutoFill() {
    const text = description.trim();
    if (text.length < 10) {
      showToast("Add a bit more detail before auto-fill", "error");
      return;
    }

    try {
      setIsGenerating(true);
      if (isListening) toggle();

      const draft = await apiPost<InvoiceDraftResult>("/ai/invoice-draft", {
        description: text,
      });

      onApply(draft);

      if (draft.clientName && !draft.clientMatched) {
        showToast(
          `Couldn't match client "${draft.clientName}" — select one manually`,
          "error",
        );
      } else {
        showToast("Form filled from your description — review before saving");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to auto-fill invoice";
      showToast(message, "error");
    } finally {
      setIsGenerating(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[5],
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.base,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[900],
    margin: "0 0 4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const hintStyle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[600],
    margin: "0 0 16px",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[900],
    backgroundColor: theme.colors.white,
    outline: "none",
    resize: "vertical",
    minHeight: "96px",
    boxSizing: "border-box",
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing[3],
    marginTop: theme.spacing[3],
    alignItems: "center",
  };

  const btnAutoFill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    borderRadius: theme.radius.md,
    border: "none",
    cursor: isGenerating ? "not-allowed" : "pointer",
    opacity: isGenerating ? 0.65 : 1,
  };

  const btnMic: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    backgroundColor: isListening ? theme.colors.danger[50] : theme.colors.white,
    color: isListening
      ? theme.colors.danger[600]
      : theme.colors.neutral[600],
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    borderRadius: theme.radius.md,
    border: `1px solid ${
      isListening ? theme.colors.danger[200] : theme.colors.neutral[200]
    }`,
    cursor: supported ? "pointer" : "not-allowed",
    opacity: supported ? 1 : 0.5,
  };

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>
        <Sparkles size={18} color={theme.colors.accent[600]} />
        Describe invoice
      </h3>
      <p style={hintStyle}>
        Type or speak what to bill — we&apos;ll draft the form for you to review.
      </p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='e.g. "Invoice Ahmed Hardware, 10 bags cement at 2200 each, delivery 1500, due in 7 days, standard GST"'
        rows={4}
        disabled={isGenerating}
        style={textareaStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary[600];
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.neutral[200];
        }}
      />

      <div style={actionsStyle}>
        <button
          type="button"
          onClick={toggle}
          disabled={!supported || isGenerating}
          style={btnMic}
          title={
            supported
              ? isListening
                ? "Stop listening"
                : "Speak your invoice description"
              : "Voice input needs Chrome or Edge"
          }
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          {isListening ? "Stop" : "Voice"}
        </button>

        <button
          type="button"
          onClick={handleAutoFill}
          disabled={isGenerating}
          style={btnAutoFill}
        >
          <Sparkles size={16} />
          {isGenerating ? "Filling…" : "Auto-fill"}
        </button>

        {!supported && (
          <span style={{ ...hintStyle, margin: 0 }}>
            Voice works best in Chrome or Edge
          </span>
        )}
        {isListening && (
          <span
            style={{
              ...hintStyle,
              margin: 0,
              color: theme.colors.danger[600],
            }}
          >
            Listening…
          </span>
        )}
      </div>
    </div>
  );
}
