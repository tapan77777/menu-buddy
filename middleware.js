// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  const baseDomain = 'menubuddy.co.in'; // Adjust if you change domain
  const subdomain = hostname.replace(`.${baseDomain}`, '');

  // If not a subdomain or already hitting restaurant path, ignore
  if (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    url.pathname.startsWith('/restaurant') ||
    url.pathname.startsWith('/api') || // ignore API
    url.pathname.startsWith('/_next') || // ignore internal Next.js
    url.pathname.includes('.') // ignore static files
  ) {
    return NextResponse.next();
  }

  // Rewrite subdomain to /restaurant/[slug]
  if (subdomain) {
    url.pathname = `/restaurant/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'], // Protects _next and static files
};
