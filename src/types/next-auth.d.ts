import NextAuth, {
  User,
  Session,
  DefaultUser,
  DefaultSession,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "@prisma/client";

// Extend the NextAuth.js interfaces to include project-specific fields
declare module "next-auth" {
  /**
   * The object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    name: string;
    role: string;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's ID. */
      id: number;
      /** The user's role. */
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** User's ID */
    id: number;
    /** User's role */
    role: Role;
  }
}
