import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import authConfig from "./config/auth";
import prisma from "./lib/prisma";
import { Roles } from "./types";

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

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: process.env.BREVO_HOST,
        port: parseInt(process.env.BREVO_PORT || "587"),
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD,
        },
      },
      from: process.env.BREVO_SENDER_EMAIL,
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      const userExist = await prisma.user.findFirst({
        where: { email: user.email as string },
      });
      if (!userExist) return false;

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
