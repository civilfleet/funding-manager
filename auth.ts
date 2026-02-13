import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import authConfig from "./config/auth";
import {
  loadTeamOidcProviders,
  resolveExpectedProviderByEmail,
} from "./lib/auth-routing";
import mailConfig from "./config/mail";
import prisma from "./lib/prisma";
import type { Roles } from "./types";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      provider?: string;
      roles?: Roles[];
      organizationId?: string;
      teamId?: string;

      userId?: string;
    } & DefaultSession["user"];
  }
}

const buildAuth = async () => {
  const teamOidcProviders = await loadTeamOidcProviders();

  return NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
      Nodemailer({
        server: mailConfig,
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        maxAge: 24 * 60 * 60, // 24 hours
      }),
      ...teamOidcProviders,
    ],
    session: { strategy: "jwt" },
    callbacks: {
      async signIn({ user, account }) {
        if (!account || !user.email) return false;

        const userExist = await prisma.user.findFirst({
          where: { email: user.email as string },
        });
        if (!userExist) return false;
        try {
          const expectedProvider = await resolveExpectedProviderByEmail(user.email);
          if (expectedProvider !== account.provider) return false;
        } catch {
          return false;
        }

        return true;
      },

      async jwt({ token, user, account }) {
        if (account && user) {
          token.accessToken = account.access_token;
          token.provider = account.provider;
          const userExist = await prisma.user.findFirst({
            where: { email: user.email as string },
            select: {
              roles: true,
              id: true,
            },
          });

          token.roles = userExist?.roles;
          token.userId = userExist?.id;
        }

        return token;
      },

      async session({ session, token }) {
        const accessToken = token.accessToken as string | undefined;
        if (session.user) {
          session.user.accessToken = accessToken;
          session.user.userId = token.userId as string | undefined;
          session.user.roles = token.roles as Roles[] | undefined;
          session.user.organizationId = token.organizationId as
            | string
            | undefined;
          session.user.teamId = token.teamId as string | undefined;
        }

        return session;
      },
    },
  });
};

export const handlers = {
  GET: async (...args: any[]) => {
    const authInstance = await buildAuth();
    return (authInstance.handlers.GET as any)(...args);
  },
  POST: async (...args: any[]) => {
    const authInstance = await buildAuth();
    return (authInstance.handlers.POST as any)(...args);
  },
};

export const auth = async (...args: any[]) => {
  const authInstance = await buildAuth();
  return (authInstance.auth as any)(...args);
};

export const signIn = async (...args: any[]) => {
  const authInstance = await buildAuth();
  return (authInstance.signIn as any)(...args);
};

export const signOut = async (...args: any[]) => {
  const authInstance = await buildAuth();
  return (authInstance.signOut as any)(...args);
};
