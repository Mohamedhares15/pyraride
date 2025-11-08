import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { verifyPassword, normalizePhoneNumber } from "./auth-utils";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!identifier || !password) {
          throw new Error("Missing credentials");
        }

        const normalizedIdentifier = identifier.includes("@")
          ? identifier.toLowerCase()
          : normalizePhoneNumber(identifier);

        const user = identifier.includes("@")
          ? await prisma.user.findUnique({
              where: { email: normalizedIdentifier },
            })
          : await prisma.user.findUnique({
              where: { phoneNumber: normalizedIdentifier },
            });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (!user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName || user.email,
          role: user.role,
          phoneNumber: user.phoneNumber ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        (token as any).phoneNumber = (user as any).phoneNumber ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phoneNumber = (token as any).phoneNumber ?? null;
      }
      return session;
    },
  },
};

import { getServerSession as getSession } from "next-auth/next";

export const getServerSession = () => {
  return getSession(authOptions);
};
