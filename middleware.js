// middleware.js - Place this in your root directory (same level as pages or app folder)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract subdomain (e.g., "lha-kitchen" from "lha-kitchen.menubuddy.co.in")
  const subdomain = host.split('.')[0];

  // Skip rewriting for main domain or local development
  if (
    subdomain === 'www' || 
    subdomain === 'menubuddy' || 
    host.includes('localhost') || 
    host.includes('vercel.app')
  ) {
    return NextResponse.next();
  }

  // Rewrite subdomain requests
  if (subdomain && subdomain !== 'www') {
    // Avoid infinite loop
    if (!url.pathname.startsWith('/restaurant/')) {
      // If root path → redirect to /restaurant/[subdomain]/menu
      url.pathname = url.pathname === '/' 
        ? `/restaurant/${subdomain}/menu` 
        : `/restaurant/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * - api routes
     * - static assets
     * - image optimizations
     * - favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
