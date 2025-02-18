import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "./config/auth";

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

    async jwt({ token, user, account, session, trigger }) {
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

        // token.organizationId = contact?.organizations[0]?.id;
        // token.teamId = contact?.teams[0]?.id;

        token.contactType = contact?.type;
        token.contactId = contact?.id;
      }

      if (trigger === "update") {
        token.organizationId = session?.user.organizationId;
        token.teamId = session?.user.teamId;
      }
      return token;
    },

    async session({ session, token }) {
      const accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.accessToken = accessToken;
        session.user.contactId = token.contactId as string | undefined;
        session.user.contactType = token.contactType as ContactType | undefined;
        session.user.organizationId = token.organizationId as
          | string
          | undefined;
        session.user.teamId = token.teamId as string | undefined;
      }

      return session;
    },
  },
});
