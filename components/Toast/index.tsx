"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import theme from "@/styles/theme";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: "12px 20px",
              borderRadius: theme.radius.md,
              backgroundColor:
                toast.type === "success"
                  ? theme.colors.success[600]
                  : theme.colors.danger[600],
              color: theme.colors.white,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              boxShadow: theme.shadows.lg,
              animation: "slideIn 0.3s ease",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functionality Summary
// • Implements a global toast notification system using React Context for
//   application-wide access.
// • Exposes the useToast hook, allowing any component to display success or
//   error notifications without prop drilling.
// • Provides a showToast function that dynamically adds new toast messages with
//   configurable notification types.
// • Automatically dismisses toast notifications after a predefined duration to
//   keep the interface clean and unobtrusive.
// • Renders notifications in a fixed-position container at the bottom-right of
//   the viewport, supporting multiple stacked toasts.
// • Applies distinct visual styling for success and error notifications using
//   semantic theme colors for quick recognition.
// • Includes a slide-in animation that smoothly introduces new notifications,
//   improving the overall user experience.
// • Uses the centralized theme configuration to maintain consistent typography,
//   colors, border radius, shadows, and overall styling across notifications.
// • Wraps the application with a provider component so toast functionality is
//   available throughout the component tree.
// ─────────────────────────────────────────────────────────────────────────────
