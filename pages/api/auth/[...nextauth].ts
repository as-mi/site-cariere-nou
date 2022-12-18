import NextAuth, { Session, User } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

import GoogleProvider from "next-auth/providers/google";

import { Role } from "@prisma/client";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleProvider = GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        role: Role.PARTICIPANT,
      };
    },
  });

  providers.push(googleProvider);
}

type SessionCallbackParams = {
  session: Session;
  user: User;
};

export const authOptions = {
  // Configure the Prisma database adapter,
  // which will be used to persist user and authentication data.
  adapter: PrismaAdapter(prisma),
  // Here we configure the authentication providers,
  // which are the different ways the user can choose to log in.
  providers,
  // These callbacks will be invoked by NextAuth when various events happen,
  // allowing us to respond to them.
  callbacks: {
    async session({ session, user }: SessionCallbackParams) {
      session.user.id = parseInt(user.id);

      return session;
    },
  },
};

export default NextAuth(authOptions);
