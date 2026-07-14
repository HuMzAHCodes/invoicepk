"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { apiPost } from "@/lib/api-client";
import { useToast } from "@/components/Toast";
import theme from "@/styles/theme";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "What payments are still overdue?",
  "Which invoices are unpaid?",
  "Summarize this month's invoices",
];

export default function AssistantChat() {
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Ask about your invoices — overdue payments, unpaid totals, a client's balance, or this month's summary.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await apiPost<{ reply: string; tool: string }>("/ai/chat", {
        message: text,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get an answer";
      showToast(message, "error");
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "Sorry — I couldn't answer that right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const shell: React.CSSProperties = {
    maxWidth: "720px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[4],
    height: "calc(100vh - 140px)",
    minHeight: "480px",
  };

  const header: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const title: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral[900],
    margin: 0,
  };

  const subtitle: React.CSSProperties = {
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[600],
    margin: "4px 0 0",
  };

  const panel: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    minHeight: 0,
  };

  const thread: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: theme.spacing[5],
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing[3],
  };

  const suggestionsRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: `0 ${theme.spacing[5]} ${theme.spacing[3]}`,
  };

  const chip: React.CSSProperties = {
    border: `1px solid ${theme.colors.neutral[200]}`,
    backgroundColor: theme.colors.neutral[50],
    color: theme.colors.neutral[600],
    borderRadius: theme.radius.md,
    padding: "6px 10px",
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.body,
    cursor: isLoading ? "not-allowed" : "pointer",
  };

  const composer: React.CSSProperties = {
    display: "flex",
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.neutral[200]}`,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 12px",
    border: `1px solid ${theme.colors.neutral[200]}`,
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    outline: "none",
  };

  const sendBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: `10px 16px`,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.white,
    border: "none",
    borderRadius: theme.radius.md,
    fontFamily: theme.fonts.body,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.65 : 1,
  };

  return (
    <div style={shell}>
      <div style={header}>
        <MessageCircle size={22} color={theme.colors.primary[600]} />
        <div>
          <h1 style={title}>Ask InvoicePK</h1>
          <p style={subtitle}>
            Answers from your real invoice data — not guesses.
          </p>
        </div>
      </div>

      <div style={panel}>
        <div style={thread}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const bubble: React.CSSProperties = {
              alignSelf: isUser ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: theme.radius.md,
              backgroundColor: isUser
                ? theme.colors.primary[600]
                : theme.colors.neutral[50],
              color: isUser ? theme.colors.white : theme.colors.neutral[900],
              border: isUser
                ? "none"
                : `1px solid ${theme.colors.neutral[200]}`,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
            };
            return (
              <div key={msg.id} style={bubble}>
                {msg.text}
              </div>
            );
          })}
          {isLoading && (
            <div
              style={{
                alignSelf: "flex-start",
                color: theme.colors.neutral[600],
                fontSize: theme.fontSizes.sm,
                fontFamily: theme.fonts.body,
              }}
            >
              Checking your invoices…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {!messages.some((m) => m.role === "user") && (
          <div style={suggestionsRow}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                style={chip}
                disabled={isLoading}
                onClick={() => void sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form style={composer} onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='e.g. "What payments are still overdue?"'
            disabled={isLoading}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary[600];
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.neutral[200];
            }}
          />
          <button type="submit" style={sendBtn} disabled={isLoading}>
            <Send size={16} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
