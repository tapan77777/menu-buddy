import { getSubdomain } from "@/lib/utils/getSubdomain"; // Adjust path
import { NextResponse } from "next/server";

export function middleware(request) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl;
  const subdomain = getSubdomain(hostname);

  // If it's a subdomain and not already at /restaurant/[slug]
  if (subdomain && !url.pathname.startsWith("/restaurant")) {
    url.pathname = `/restaurant/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
