// app/(auth)/login/page.tsx
// Login page — Email/Password authentication via Firebase client SDK.
// Checks emailVerified before allowing access to dashboard.
// Shows friendly error for unregistered emails.

"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Check email verification
      if (!user.emailVerified) {
        await auth.signOut();
        setError(
          "Please verify your email before logging in. Check your inbox for the verification link.",
        );
        setLoading(false);
        return;
      }

      // Set auth cookie for middleware
      const token = await user.getIdToken();
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Strict`;

      router.push("/dashboard");
    } catch (err: any) {
      const code = err.code ?? "";

      if (
        code === "auth/user-not-found" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-email"
      ) {
        setError("No account found with this email. Please register first.");
      } else if (code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

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
        Welcome back
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "#6E6A5D",
          margin: "0 0 1.5rem",
        }}
      >
        Sign in to your InvoicePK account
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

      {/* Email field */}
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

      {/* Password field */}
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
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

      {/* Login button */}
      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor:
            loading || !email || !password ? "#A9C9B4" : "#1F5C3F",
          color: "#FFFFFF",
          fontFamily: "var(--font-body)",
          fontSize: "0.9375rem",
          fontWeight: 600,
          border: "none",
          borderRadius: "0.5rem",
          cursor: loading || !email || !password ? "not-allowed" : "pointer",
          transition: "background-color 0.15s ease",
          marginBottom: "1.25rem",
        }}
        onMouseEnter={(e) => {
          if (!loading && email && password)
            (e.target as HTMLButtonElement).style.backgroundColor = "#4B8867";
        }}
        onMouseLeave={(e) => {
          if (!loading && email && password)
            (e.target as HTMLButtonElement).style.backgroundColor = "#1F5C3F";
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {/* Register link */}
      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "#6E6A5D",
          margin: 0,
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          style={{
            color: "#1F5C3F",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}

// app/(auth)/login/page.tsx
// Login page — Email/Password authentication via Firebase client SDK.
// Checks emailVerified before allowing access to dashboard.
// Shows friendly error for unregistered emails.
// Uses controlled React state to manage form inputs, loading state, and
// authentication errors. On successful login, retrieves the Firebase ID
// token, stores it in a browser cookie for middleware-based route protection,
// redirects authenticated users to the dashboard, and maps common Firebase
// authentication errors to clear, user-friendly messages.
