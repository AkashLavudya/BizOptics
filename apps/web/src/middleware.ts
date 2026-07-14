import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard', '/businesses', '/search', '/analytics',
  '/recommendations', '/export', '/settings', '/admin',
];

// Auth paths that should redirect to dashboard only when token is definitely valid
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  const isAuthPath = authPaths.some(p => pathname.startsWith(p));

  if (!isProtected && !isAuthPath) return NextResponse.next();

  // Read the accessToken cookie
  const token = request.cookies.get('accessToken')?.value;

  // Protected route with no cookie → send to login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Don't add ?from= for dashboard root to avoid redirect loop chains
    if (pathname !== '/dashboard') {
      url.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(url);
  }

  // Auth path with cookie → send to dashboard
  // Only redirect if there is a real non-empty token value
  if (isAuthPath && token && token.length > 20) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals, static files, and API routes
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
};
