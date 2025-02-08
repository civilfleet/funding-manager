import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "./config/auth";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      roles?: string[];
      teamsId?: string[];
      organizationId?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      if (account.provider === "keycloak") {
        if (!account.access_token) return false;

        const decodedToken = jwt.decode(account.access_token);
        if (!decodedToken || typeof decodedToken === "string") return false;

        const rolesAccess =
          decodedToken.resource_access?.["funding-manager"]?.roles || [];
        if (rolesAccess.includes("fm-admin")) return true;

        const teams = await prisma.teams.findMany({
          where: { roleName: { in: rolesAccess } },
        });
        return teams.length > 0;
      }

      if (account.provider === "google") {
        if (!user.email) return false;

        const contact = await prisma.contactPerson.findFirst({
          where: { email: user.email },
          select: { organizationId: true },
        });
        return !!contact?.organizationId;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;

        if (account.provider === "keycloak" && account.access_token) {
          const decodedToken = jwt.decode(account.access_token);

          if (decodedToken && typeof decodedToken === "object") {
            const rolesAccess =
              decodedToken.resource_access?.["funding-manager"]?.roles || [];
            const teams = await prisma.teams.findMany({
              where: { roleName: { in: rolesAccess } },
            });
            token.teamsId = teams.map((team) => team.id);
          }
        }

        if (account.provider === "google" && user.email) {
          const contact = await prisma.contactPerson.findFirst({
            where: { email: user.email },
            select: { organizationId: true },
          });
          if (contact?.organizationId) {
            token.organizationId = contact.organizationId;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      let rolesAccess: string[] = [];
      const accessToken = token.accessToken as string | undefined;

      if (accessToken) {
        const decodedToken = jwt.decode(accessToken);
        if (decodedToken && typeof decodedToken === "object") {
          rolesAccess =
            decodedToken.resource_access?.["funding-manager"]?.roles || [];
        }
      }

      if (session.user) {
        session.user.roles = rolesAccess;
        session.user.accessToken = accessToken;
        session.user.teamsId = token.teamsId as string[] | undefined;
        session.user.organizationId = token.organizationId as
          | string
          | undefined;
      }
      return session;
    },
  },
});
