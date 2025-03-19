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
  const roles = (token?.roles as string[]) || [];

  const isOrganization = roles.includes("Organization");
  const isTeam = roles.includes("Team");
  const isAdmin = roles.includes("Admin");

  if (!isTeam && nextUrl.pathname.startsWith("/teams")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (!isOrganization && nextUrl.pathname.startsWith("/organizations")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  if (!isAdmin && nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/teams/:path*", "/organizations/:path*"],
};
