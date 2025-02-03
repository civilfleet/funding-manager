import NextAuth, { DefaultSession } from "next-auth";
import { redirect } from "next/navigation";
import authConfig from "./config/auth";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma";
import { NextResponse } from "next/server";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      accessToken?: string;
      roles?: string[];
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async authorized({ request, auth }) {
      const url = request.nextUrl;
      console.log("Next URL:", url);

      return NextResponse.redirect(new URL("/login", request.url));
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "keycloak") {
        if (!account?.access_token) return false;
        const decodedToken = jwt.decode(account.access_token as string);
        if (!decodedToken || typeof decodedToken === "string") return false;
        const rolesAccess: string[] =
          decodedToken["resource_access"]?.["funding-manager"]?.["roles"] || [];
        console.log("Roles Access:", rolesAccess);
        if (rolesAccess.includes("fm-admin")) return true;
        const teams = await prisma.teams.findMany({
          where: {
            roleName: { in: rolesAccess },
          },
        });
        console.log("Teams from Prisma:", teams);
        return teams.length > 0;
      }
      if (account?.provider === "google") {
        // check if the organization exist
        const organization = await prisma.organization.findMany({
          where: {
            email: user.email as string,
          },
        });
        if (!organization) return false;
      }
      return false;
    },

    async jwt({ token, user, account, profile }) {
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
