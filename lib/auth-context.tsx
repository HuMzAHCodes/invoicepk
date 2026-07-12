// lib/auth-context.tsx
// Global auth context — provides current Firebase user and token
// to every client component in the app.
// Wrap the app in <AuthProvider> in the root layout.
// Use the useAuth() hook in any client component to access auth state.

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

// ─── Types ─────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// ─── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signOut: async () => {},
});

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);

        // Store token in cookie for middleware to read
        document.cookie = `firebaseToken=${idToken}; path=/; max-age=3600; SameSite=Strict`;
      } else {
        setUser(null);
        setToken(null);

        // Clear cookie on sign out
        document.cookie = "firebaseToken=; path=/; max-age=0";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    document.cookie = "firebaseToken=; path=/; max-age=0";
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// lib/auth-context.tsx
// Client-side authentication context powered by Firebase Authentication.
// Tracks the current user's authentication state, exposes the authenticated
// user, ID token, loading state, and sign-out functionality throughout the app,
// synchronizes the Firebase ID token with a browser cookie for middleware-based
// route protection, and provides a custom useAuth() hook for convenient access
// from any client component.
