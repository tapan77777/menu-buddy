// middleware.js
import { getSubdomain } from "@/lib/utils/getSubdomain";
import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl;
  const subdomain = getSubdomain(hostname);

  // Prevent rewrites for assets and _next folder
  if (
    subdomain &&
    !url.pathname.startsWith("/restaurant") &&
    !url.pathname.startsWith("/_next") &&
    !url.pathname.includes(".")
  ) {
    url.pathname = `/restaurant/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// This ensures middleware runs on every path except static files
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
