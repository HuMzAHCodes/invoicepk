// app/(auth)/login/page.tsx
// Single auth page — Google Sign-In only.
// Handles both new and existing users automatically.
// New users → Business document created via /api/auth/register
// Existing users → redirected to dashboard directly.

"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      // 1. Google Sign-In popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Get Firebase ID token
      const token = await user.getIdToken();

      // 3. Ensure Business document exists (creates one if new user)
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName:
            user.displayName ?? user.email?.split("@")[0] ?? "My Business",
        }),
      });

      if (!registerRes.ok) {
        throw new Error("Failed to set up account. Please try again.");
      }

      // 4. Create server-side session cookie (httpOnly, secure)
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });

      if (!sessionRes.ok) {
        const errData = await sessionRes.json().catch(() => ({}));
        throw new Error(errData.error?.message ?? "Session creation failed.");
      }

      const { redirect } = await sessionRes.json();

      // 5. Hard navigation — ensures cookie is sent with request
      window.location.href = redirect;
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed the popup — not an error
        setLoading(false);
        return;
      }
      if (err.code === "auth/popup-blocked") {
        setError(
          "Popup was blocked by your browser. Please allow popups for this site.",
        );
      } else {
        setError(err.message ?? "Sign-in failed. Please try again.");
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
          textAlign: "center",
        }}
      >
        Welcome to InvoicePK
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "#6E6A5D",
          margin: "0 0 2rem",
          textAlign: "center",
        }}
      >
        Sign in to manage your invoices
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
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Google Sign-In button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          backgroundColor: loading ? "#F7F5EF" : "#FFFFFF",
          color: "#2B2924",
          fontFamily: "var(--font-body)",
          fontSize: "0.9375rem",
          fontWeight: 500,
          border: "1.5px solid #DEDACB",
          borderRadius: "0.5rem",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          transition: "all 0.15s ease",
          marginBottom: "1.5rem",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = "#1F5C3F";
            e.currentTarget.style.backgroundColor = "#F7F5EF";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = "#DEDACB";
            e.currentTarget.style.backgroundColor = "#FFFFFF";
          }
        }}
      >
        {/* Google SVG icon */}
        {!loading && (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      {/* Terms note */}
      <p
        style={{
          textAlign: "center",
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          color: "#A8A395",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        By signing in, you agree to our terms of service.
        <br />
        Free plan includes 5 invoices/month.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE FUNCTIONALITY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
//
// Purpose:
// This page provides the application's single authentication interface using
// Google Sign-In with Firebase Authentication. It handles both first-time and
// returning users automatically, creates new business accounts when necessary,
// establishes a secure server-side session, and redirects authenticated users
// to the dashboard.
//
// Route:
//
// /login
//
// Primary Responsibilities:
//
// • Display the Google Sign-In interface.
// • Authenticate users with Firebase Authentication.
// • Automatically register new users.
// • Create secure server-side authentication sessions.
// • Handle authentication errors gracefully.
// • Redirect authenticated users into the application.
//
// Authentication Flow:
//
// ┌─────────────────────────┐
// │ User clicks Sign In     │
// └─────────────┬───────────┘
//               │
//               ▼
//     Google Authentication Popup
//               │
//               ▼
//     Firebase authenticates user
//               │
//               ▼
//     Firebase returns authenticated user
//               │
//               ▼
//     Retrieve Firebase ID Token
//               │
//               ▼
//     POST /api/auth/register
//               │
//     Creates Business document if needed
//               │
//               ▼
//     POST /api/auth/session
//               │
//     Creates secure httpOnly session cookie
//               │
//               ▼
//     Browser performs hard navigation
//               │
//               ▼
//          /dashboard
//
// Component State:
//
// loading
// • Indicates whether authentication is currently in progress.
// • Disables the sign-in button.
// • Prevents duplicate login attempts.
// • Changes the button label to "Signing in...".
//
// error
// • Stores authentication or registration errors.
// • Displays a styled error message above the login button.
// • Cleared whenever a new login attempt begins.
//
// Google Authentication Process:
//
// 1. User clicks "Continue with Google".
//
// 2. Opens Firebase Google popup using:
//
//      signInWithPopup(auth, provider)
//
// 3. Google authenticates the user.
//
// 4. Firebase returns:
//
//      • User object
//      • Authentication credentials
//      • Access to Firebase ID Token
//
// Firebase Token:
//
// After successful authentication:
//
//      user.getIdToken()
//
// retrieves a signed Firebase ID token that proves the user's identity.
//
// This token is used for all subsequent authenticated API requests.
//
// Account Registration:
//
// The page always calls:
//
//      POST /api/auth/register
//
// using the Firebase ID token.
//
// Purpose:
//
// • First-time user
//      → Creates a new Business document.
//
// • Existing user
//      → Detects existing account and simply returns success.
//
// This allows both new and returning users to follow exactly the same login
// flow without requiring separate registration and login pages.
//
// Default Business Name:
//
// When registering a business:
//
// Priority:
//
// 1. Google display name
// 2. Email username
// 3. "My Business"
//
// This ensures every business starts with a meaningful default name.
//
// Session Creation:
//
// After registration succeeds, the page calls:
//
//      POST /api/auth/session
//
// The session endpoint:
//
// • Verifies the Firebase token.
// • Creates a secure httpOnly cookie.
// • Returns:
//
//      {
//          success: true,
//          redirect: "/dashboard"
//      }
//
// Browser Navigation:
//
// Instead of using:
//
//      router.push(...)
//
//
// the page intentionally performs:
//
//      window.location.href = redirect
//
// Reason:
//
// A full browser navigation guarantees that the newly-created httpOnly cookie
// is included in the very first request to protected dashboard pages,
// preventing authentication race conditions.
//
// Error Handling:
//
// The component handles several authentication scenarios.
//
// Popup Closed:
//
// Error:
//
//      auth/popup-closed-by-user
//
// Behavior:
//
// • No error shown.
// • Loading stops.
// • User simply remains on the login page.
//
// Popup Blocked:
//
// Error:
//
//      auth/popup-blocked
//
// Behavior:
//
// • Displays an explanation asking the user to allow popups.
//
// Registration Failure:
//
// Possible causes:
//
// • API unavailable
// • Network failure
// • Backend validation error
//
// Displays:
//
//      "Failed to set up account. Please try again."
//
// Session Creation Failure:
//
// Possible causes:
//
// • Invalid Firebase token
// • Expired authentication
// • Server error
//
// Displays either:
//
// • Backend error message
// • Generic session creation error
//
// Unknown Errors:
//
// Any unexpected exception displays:
//
//      err.message
//
// or
//
//      "Sign-in failed. Please try again."
//
// UI Elements:
//
// Header
// • Welcomes users.
// • Explains the application's purpose.
//
// Error Alert
// • Appears only when an error exists.
// • Uses warning colors for visibility.
//
// Google Sign-In Button
// • Displays Google branding.
// • Disabled while authenticating.
// • Hover effects improve user interaction.
// • Prevents multiple simultaneous requests.
//
// Footer Note
// • Displays terms acknowledgement.
// • Shows free plan limitations.
//
// Security Features:
//
// ✓ Uses Firebase Authentication.
// ✓ Never stores passwords.
// ✓ Authentication handled by Google.
// ✓ Uses signed Firebase ID tokens.
// ✓ Server creates secure httpOnly session cookies.
// ✓ Tokens are never manually stored in localStorage.
// ✓ Duplicate sign-in attempts prevented.
// ✓ Registration endpoint protected using Bearer authentication.
//
// APIs Used:
//
// POST /api/auth/register
//
// Purpose:
// • Create Business document for first-time users.
// • Return success for existing users.
//
// Authentication:
// • Bearer Firebase ID Token
//
// ----------------------------------------------------
//
// POST /api/auth/session
//
// Purpose:
// • Verify Firebase token.
// • Create secure authenticated session.
// • Return dashboard redirect.
//
// Authentication:
// • Firebase ID Token
//
// Dependencies:
//
// React
// • useState
//      Manages loading and error state.
//
// Firebase Authentication
// • signInWithPopup()
// • GoogleAuthProvider
// • auth
//
// Next.js
// • useRouter()
//      Imported for future navigation needs (currently unused because hard
//      navigation is intentionally preferred).
//
// Backend APIs
// • /api/auth/register
// • /api/auth/session
//
// End Result:
//
// This page serves as the complete authentication entry point for InvoicePK.
// It authenticates users with Google, automatically provisions new business
// accounts, establishes secure server-side authentication using an httpOnly
// cookie, gracefully handles authentication failures, and redirects users into
// the protected dashboard with an authenticated session.
// ─────────────────────────────────────────────────────────────────────────────
