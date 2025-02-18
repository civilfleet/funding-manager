import { NextResponse } from "next/server";
import { auth } from "./auth";

export const ROOT = "/";
export const PUBLIC_ROUTES = ["/"];
export const DEFAULT_REDIRECT = "/protected";

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = await auth();
  console.log("session", session);

  if (!session) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  const isAdmin = session?.user?.contactType === "Admin";
  const isOrganization = session?.user?.contactType === "Organization";
  const isTeam = session.user?.contactType === "Team";

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
