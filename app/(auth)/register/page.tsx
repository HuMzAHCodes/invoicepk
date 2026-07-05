// app/(auth)/register/page.tsx
// Register page — creates Firebase account via backend API,
// then sends email verification link via Firebase client SDK.
// User must verify email before they can log in.

"use client";

import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  async function handleRegister() {
    setError("");

    // Client-side validation
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create account via backend API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error?.message ?? "Registration failed. Please try again.",
        );
        setLoading(false);
        return;
      }

      // 2. Sign in temporarily to get user object for sendEmailVerification
      const result = await signInWithEmailAndPassword(auth, email, password);

      // 3. Send verification email
      await sendEmailVerification(result.user);

      // 4. Sign out immediately — user must verify email first
      await auth.signOut();

      // 5. Show success screen
      setVerified(true);
    } catch (err: any) {
      const code = err.code ?? "";

      if (code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists. Please log in instead.",
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────

  if (verified) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: "#EAF5EC",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: "1.5rem",
          }}
        >
          ✉️
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1F5C3F",
            margin: "0 0 0.5rem",
          }}
        >
          Check your email
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "#6E6A5D",
            margin: "0 0 1.5rem",
            lineHeight: 1.6,
          }}
        >
          We sent a verification link to{" "}
          <strong style={{ color: "#2B2924" }}>{email}</strong>. Click the link
          in your email to activate your account.
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "#A8A395",
            margin: 0,
          }}
        >
          Already verified?{" "}
          <Link
            href="/login"
            style={{
              color: "#1F5C3F",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // ── Register form ───────────────────────────────────────────────────────

  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#1F5C3F",
          margin: "0 0 0.25rem",
        }}
      >
        Create your account
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "#6E6A5D",
          margin: "0 0 1.5rem",
        }}
      >
        Free forever — up to 5 invoices per month
      </p>

      {/* Error message */}
      {error && (
        <div
          style={{
            backgroundColor: "#FBEAEA",
            border: "1px solid #E9A8A8",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            color: "#B23333",
          }}
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#2B2924",
            marginBottom: "0.375rem",
          }}
        >
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            color: "#2B2924",
            backgroundColor: "#F7F5EF",
            border: "1px solid #DEDACB",
            borderRadius: "0.5rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1F5C3F")}
          onBlur={(e) => (e.target.style.borderColor = "#DEDACB")}
        />
      </div>

      {/* Password */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#2B2924",
            marginBottom: "0.375rem",
          }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            color: "#2B2924",
            backgroundColor: "#F7F5EF",
            border: "1px solid #DEDACB",
            borderRadius: "0.5rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1F5C3F")}
          onBlur={(e) => (e.target.style.borderColor = "#DEDACB")}
        />
      </div>

      {/* Confirm Password */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#2B2924",
            marginBottom: "0.375rem",
          }}
        >
          Confirm password
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.9375rem",
            color: "#2B2924",
            backgroundColor: "#F7F5EF",
            border: "1px solid #DEDACB",
            borderRadius: "0.5rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1F5C3F")}
          onBlur={(e) => (e.target.style.borderColor = "#DEDACB")}
        />
      </div>

      {/* Register button */}
      <button
        onClick={handleRegister}
        disabled={loading || !email || !password || !confirm}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor:
            loading || !email || !password || !confirm ? "#A9C9B4" : "#1F5C3F",
          color: "#FFFFFF",
          fontFamily: "var(--font-body)",
          fontSize: "0.9375rem",
          fontWeight: 600,
          border: "none",
          borderRadius: "0.5rem",
          cursor:
            loading || !email || !password || !confirm
              ? "not-allowed"
              : "pointer",
          transition: "background-color 0.15s ease",
          marginBottom: "1.25rem",
        }}
        onMouseEnter={(e) => {
          if (!loading && email && password && confirm)
            (e.target as HTMLButtonElement).style.backgroundColor = "#4B8867";
        }}
        onMouseLeave={(e) => {
          if (!loading && email && password && confirm)
            (e.target as HTMLButtonElement).style.backgroundColor = "#1F5C3F";
        }}
      >
        {loading ? "Creating account..." : "Create free account"}
      </button>

      {/* Login link */}
      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "#6E6A5D",
          margin: 0,
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          style={{
            color: "#1F5C3F",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

// app/(auth)/register/page.tsx
// Registration page for creating new user accounts using Firebase Authentication.
// Validates user input (password strength and confirmation), then sends the
// registration request to the backend API to create the account securely.
// After successful creation, signs the user in temporarily to send a Firebase
// email verification link, signs them out again, and displays a verification
// success screen until the user activates their account.
