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
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = token.userRoles === "Admin";
  const isOrganization = token.userRoles === "Organization";
  const isTeam = token.userRoles === "Team";

  if (isOrganization && nextUrl.pathname.startsWith("/teams")) {
    return NextResponse.redirect(new URL("/organizations", nextUrl));
  }

  if (isTeam && nextUrl.pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/teams", nextUrl));
  }

  if (
    isAdmin &&
    (nextUrl.pathname.startsWith("/teams") ||
      nextUrl.pathname.startsWith("/organizations"))
  ) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  if (isAdmin && nextUrl.pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/teams/:path*", "/organizations/:path*"],
};
