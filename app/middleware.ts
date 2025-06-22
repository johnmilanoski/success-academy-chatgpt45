export const runtime = 'nodejs';

// app/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Initialize the connection pool
// Ensure the DATABASE_URL environment variable is set
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('session_token')?.value;

  const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path));
  const isProtectedPagePath = protectedPagePaths.some(path => pathname.startsWith(path));

  if (!sessionToken) {
    if (isProtectedApiPath) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (isProtectedPagePath) {
      // Redirect to login for protected pages
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname); // Optionally redirect back after login
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If a token is found, validate it
  try {
    const { rows } = await pool.query(
      `SELECT instructor_id, expires_at FROM sessions WHERE session_token = $1`,
      [sessionToken]
    );
    const session = rows[0];

    if (!session || new Date(session.expires_at) < new Date()) {
      // Invalid or expired session
      let response = NextResponse.next(); // Default to allowing non-protected paths

      if (isProtectedApiPath) {
        response = NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
      } else if (isProtectedPagePath) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('next', pathname);
        response = NextResponse.redirect(loginUrl);
      }

      // Clear the invalid cookie
      response.cookies.set('session_token', '', { path: '/', expires: new Date(0) });
      return response;
    }

    // Session is valid
    console.log('User authenticated:', session.instructor_id);

    // (Optional) Implement session renewal
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Renew for 24 hours
    await pool.query(
        `UPDATE sessions SET expires_at = $1 WHERE session_token = $2`,
        [newExpiry, sessionToken]
    );

    const response = NextResponse.next();
    // Add instructor_id to request headers for API routes
    if (isProtectedApiPath || isProtectedPagePath) { // Or any path that might need it
        response.headers.set('X-Instructor-Id', String(session.instructor_id));
    }
    response.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        expires: newExpiry,
        secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (error) {
    console.error('Middleware database error:', error);
    if (isProtectedApiPath) {
      return NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 });
    }
    if (isProtectedPagePath) {
        // For pages, redirect to an error page or login
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('error', 'auth_error');
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next(); // Allow other paths if error occurs
  }
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
