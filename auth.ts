import NextAuth, { DefaultSession } from "next-auth";
import { redirect } from "next/navigation";
import authConfig from "./config/auth";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma";
import { NextResponse } from "next/server";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      roles?: string[];
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async authorized({ request, auth }) {
      const url = request.nextUrl;
      return NextResponse.redirect(new URL("/login", request.url));
    },
    async signIn({ user, account, profile }) {
      if (!account) return false;

      // check if the user is authorized to sign-in
      if (account?.provider === "keycloak" && account?.access_token) {
        const decodedToken = jwt.decode(account.access_token as string);
        if (!decodedToken || typeof decodedToken === "string") return false;

        const rolesAccess: string[] =
          decodedToken["resource_access"]?.["funding-manager"]?.["roles"] || [];

        if (rolesAccess.includes("fm-admin")) return true;

        const teams = await prisma.teams.findMany({
          where: {
            roleName: { in: rolesAccess },
          },
        });
        return teams.length > 0;
      }

      if (account?.provider === "google") {
        const organization = await prisma.organization.findFirst({
          where: {
            email: user.email as string,
          },
        });
        return !!organization;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      let rolesAccess: string[] = [];
      let accessToken = "";

      if (token?.accessToken) {
        let decodedToken = jwt.decode(token.accessToken as string);

        if (decodedToken && typeof decodedToken !== "string") {
          rolesAccess =
            decodedToken["resource_access"]?.["funding-manager"]?.["roles"] ||
            [];
        }
      }

      if (session.user) {
        session.user.roles = rolesAccess;
        session.user.accessToken = accessToken;
      }

      return session;
    },
  },
});
