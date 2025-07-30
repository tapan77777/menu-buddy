// middleware.js - Place this in your root directory (same level as pages folder)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Extract subdomain
  const subdomain = host.split('.')[0];
  
  // Skip if it's main domain, www, or localhost
  if (subdomain === 'www' || 
      subdomain === 'menubuddy' || 
      host.includes('localhost') ||
      host.includes('vercel.app')) {
    return NextResponse.next();
  }
  
  // If it's a restaurant subdomain, rewrite to existing restaurant route
  if (subdomain && subdomain !== 'www') {
    // Check if it's already a restaurant path to avoid infinite loops
    if (!url.pathname.startsWith('/restaurant/')) {
      // Rewrite subdomain.menubuddy.co.in/menu -> menubuddy.co.in/restaurant/subdomain/menu
      url.pathname = `/restaurant/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}