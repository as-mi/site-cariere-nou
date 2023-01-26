import NextAuth, { AuthOptions } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { Role } from "@prisma/client";

import { authenticateUser } from "../../../lib/accounts";

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

if (true) {
  const credentialsProvider = CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials) {
        return null;
      }

      console.log(
        "Tring to authenticate user with e-mail `%s`",
        credentials.email
      );

      let user;
      try {
        user = await authenticateUser(credentials);
      } catch (error) {
        if (error instanceof Error) {
          console.log(
            "Failed to authenticate user `%s`: %s",
            credentials.email,
            error.message
          );
        } else {
          console.error(
            "Unexpected error was thrown during authentication:",
            error
          );
        }

        return null;
      }

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
      };
    },
  });

  providers.push(credentialsProvider);
}

export const authOptions: AuthOptions = {
  // Configure the Prisma database adapter,
  // which will be used to persist user and authentication data.
  adapter: PrismaAdapter(prisma),
  // Here we configure the authentication providers,
  // which are the different ways the user can choose to log in.
  providers,
};

export default NextAuth(authOptions);
