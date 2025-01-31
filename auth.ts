import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { authConfig } from "./config/auth";
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [Keycloak],
});
