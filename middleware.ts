import NextAuth from "next-auth";
import authConfig from "@/config/auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const ROOT = "/";
export const PUBLIC_ROUTES = ["/"];
export const DEFAULT_REDIRECT = "/protected";

export default auth(async (req) => {
  const { nextUrl } = req;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const isGoogleUser = token.provider === "google";
  const isKeycloakUser = token.provider === "keycloak";

  if (isGoogleUser && nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/organization", nextUrl));
  }

  if (isKeycloakUser && nextUrl.pathname.startsWith("/organization")) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/organizations/:path*"],
};
