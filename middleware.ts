// middleware.ts
// Route protection — runs on every request before the page renders.
// Redirects unauthenticated users away from protected routes.
// Redirects authenticated users away from login/register pages.
// Uses Firebase session cookie for server-side auth check.

import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/invoices',
  '/clients',
  '/settings',
];

// Routes only for unauthenticated users
const authRoutes = [
  '/login',
  '/register',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for Firebase auth token in cookies
  // Frontend stores token in a cookie after login
  const token = req.cookies.get('firebaseToken')?.value;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Unauthenticated user trying to access protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};







// middleware.ts
// Global Next.js middleware for route-level access control.
// Executes before protected pages are rendered, checks the Firebase
// authentication cookie to determine the user's login state, redirects
// unauthenticated users to the login page (preserving the intended
// destination), and prevents authenticated users from accessing
// authentication pages such as login and registration.