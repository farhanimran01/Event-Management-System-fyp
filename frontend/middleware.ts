import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login/user', '/login/admin', '/register/user', '/register/admin', '/login', '/register'];
  
  // If it's a public route, allow access
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/events')) {
    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL('/login/user', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
