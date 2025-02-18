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
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });
  console.log("token", token);
  if (!token) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  const isAdmin = token.contactType === "Admin";
  const isOrganization = token.contactType === "Organization";
  const isTeam = token.contactType === "Team";

  if (isOrganization && nextUrl.pathname.startsWith("/team")) {
    return NextResponse.redirect(new URL("/organization", nextUrl));
  }

  if (isTeam && nextUrl.pathname.startsWith("/organization")) {
    return NextResponse.redirect(new URL("/team", nextUrl));
  }

  if (
    isAdmin &&
    (nextUrl.pathname.startsWith("/team") ||
      nextUrl.pathname.startsWith("/organization"))
  ) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  if (isAdmin && nextUrl.pathname.startsWith("/organization")) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/team/:path*", "/organization/:path*"],
};
