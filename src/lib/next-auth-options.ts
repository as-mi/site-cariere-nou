import { AuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";

import prisma from "./prisma";
import { authenticateUser } from "./accounts";

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
        user = await authenticateUser(credentials.email, credentials.password);
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

      console.log("Successfully authenticated user with ID %d", user.id);

      if (user.emailVerified === null) {
        throw new Error("email-not-verified");
      }

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
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
  // Configure the way session tokens are generated and stored
  session: {
    // Generated session tokens as JSON Web Tokens and store them on the client side, not in the database.
    // This is to work around bugs such as https://github.com/nextauthjs/next-auth/issues/6435
    strategy: "jwt",
    // Stay logged in for 5 days by default
    maxAge: 5 * 24 * 60 * 60,
  },
  // Update some of the built-in callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (!token.id) {
        if (!user?.id) {
          throw new Error("User object has no ID set on JWT creation");
        }

        const id = parseInt(user.id);
        if (Number.isNaN(id)) {
          throw new Error("User ID is not a number on JWT creation");
        }

        token.id = id;
      }

      if (!token.role) {
        if (!user?.role) {
          throw new Error("User object has no role set on JWT creation");
        }

        // Save user role in the issued token
        token.role = user.role as Role;
      }

      return token;
    },
    async session({ session, token, user }) {
      const id = token.id ?? parseInt(user.id);
      if (!id || Number.isNaN(id)) {
        throw new Error("Unable to determine user's ID in session callback");
      }

      // Provide user's ID in client-side session object
      session.user.id = id;

      const role = token.role ?? user.role;
      if (!role) {
        throw new Error("Unable to determine user's role in session callback");
      }

      // Provide user's role in client-side session object
      session.user.role = role;

      // TODO: leaving this field undefined results in a Next.js error.
      // Need to find a better way to treat this scenario.
      session.user.image = null;

      return session;
    },
  },
  // Override some of the built-in NextAuth pages
  pages: {
    signIn: "/auth/login",
  },
};
