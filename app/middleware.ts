// app/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const protectedApiPaths = [
  '/api/instructor',
  '/api/courses', // Assuming all /api/courses/* need auth for now
  '/api/upload',
];

const protectedPagePaths = [
  '/',
  '/instructor',
  '/create-course',
  '/dashboard',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('session_token')?.value;

  const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path));
  const isProtectedPagePath = protectedPagePaths.some(path => pathname.startsWith(path));

  if (!sessionToken) {
    if (isProtectedApiPath) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (isProtectedPagePath) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Basic check: if cookie exists, allow the request.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /login (login page)
     * - /signup (signup page)
     * - /api/auth (auth routes like login, signup, logout)
     * - /api/student/catalog (public catalog API)
     */
    '/',
    '/((?!_next/static|_next/image|favicon.ico|login|signup|api/auth|api/student/catalog|$).*)',
    // Explicitly include specific protected routes that might be missed by the general pattern
    // or to ensure they are covered even if public by default.
    '/api/instructor/:path*',
    '/api/courses/:path*', // This will protect POST to /api/courses for creation
    '/api/upload/:path*',
    '/instructor/:path*',
    '/create-course/:path*',
    '/dashboard/:path*',
  ],
};
