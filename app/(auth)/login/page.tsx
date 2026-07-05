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

      // 3. Set auth cookie for middleware
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Strict`;

      // 4. Ensure Business document exists (creates one if new user)
      const res = await fetch("/api/auth/register", {
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

      if (!res.ok) {
        throw new Error("Failed to set up account. Please try again.");
      }

      // 5. Redirect to dashboard
      router.push("/dashboard");
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

/*
|--------------------------------------------------------------------------
| Functionality Summary
|--------------------------------------------------------------------------
|
| File:
|   app/(auth)/login/page.tsx
|
| Purpose:
|   Provides the application's authentication page using Google Sign-In.
|   Supports both first-time and returning users by integrating Firebase
|   Authentication with the backend registration endpoint.
|
| Authentication Flow:
|   1. User clicks "Continue with Google".
|   2. Opens the Firebase Google authentication popup.
|   3. Authenticates the user with Google.
|   4. Retrieves the Firebase ID token.
|   5. Stores the token in a browser cookie for middleware authentication.
|   6. Calls POST /api/auth/register to ensure a Business profile exists.
|   7. Redirects authenticated users to the dashboard.
|
| User Experience:
|   - Google authentication only.
|   - Automatically supports both new and existing users.
|   - Displays loading state during authentication.
|   - Prevents duplicate login attempts while processing.
|   - Displays descriptive error messages when authentication fails.
|   - Gracefully ignores popup-close events initiated by the user.
|
| UI Components:
|   - Welcome heading and application description.
|   - Google Sign-In button with official Google SVG icon.
|   - Error notification banner.
|   - Terms of service and free plan information.
|
| State Management:
|   - loading
|       Controls button state and loading indicator.
|
|   - error
|       Stores authentication and backend error messages.
|
| Backend Integration:
|   - Firebase Authentication
|       • GoogleAuthProvider
|       • signInWithPopup()
|       • getIdToken()
|
|   - API Endpoint
|       POST /api/auth/register
|       Ensures every authenticated user has a Business document.
|
| Cookie Management:
|   - Stores the Firebase ID token as:
|       firebaseToken
|   - Used by Next.js middleware for protected routes.
|
| Error Handling:
|   - Handles popup blocked errors.
|   - Handles popup closed by user without displaying an error.
|   - Handles backend registration failures.
|   - Handles unexpected authentication errors.
|
| Navigation:
|   - Successful authentication redirects users to:
|       /dashboard
|
|--------------------------------------------------------------------------
| Git Commit
|--------------------------------------------------------------------------
| feat(auth): implement Google Sign-In page with Firebase authentication,
| automatic business registration, token persistence, and dashboard redirect
|--------------------------------------------------------------------------
*/
