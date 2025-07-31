// src/middleware.js
import { getSubdomain } from "@/lib/utils/getSubdomain";
import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  const subdomain = getSubdomain(hostname);

  // Skip assets, API, or already routed restaurant paths
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

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
