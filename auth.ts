import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "./config/auth";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma";
import { ContactType } from "./types";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      provider?: string;
      contactType?: ContactType;
      organizationId?: string;
      teamId?: string;

      contactId?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      const contact = await prisma.contactPerson.findFirst({
        where: { email: user.email as string },
      });

      if (!contact) return false;

      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.provider = account.provider;

        const contact = await prisma.contactPerson.findFirst({
          where: { email: user.email as string },
          select: {
            type: true,
            id: true,
          },
        });

        token.contactType = contact?.type;
        token.contactId = contact?.id;

        // if (contact?.type === "Organization") {
        //   token.organizationId = contact.organization?.id;
        // } else if (contact?.type === "Team") {
        //   token.teamId = contact.team?.id;
        // }
        console.log("contact", contact);
      }
      return token;
    },

    async session({ session, token }) {
      const accessToken = token.accessToken as string | undefined;

      if (session.user) {
        // session.user.roles = rolesAccess;
        session.user.accessToken = accessToken;
        session.user.contactId = token.contactId as string | undefined;
        session.user.contactType = token.contactType as ContactType | undefined;
      }
      return session;
    },
  },
});
