import NextAuth, { DefaultSession } from "next-auth";

// This file is used to extend the standard types provided by NextAuth,
// as described in https://next-auth.js.org/getting-started/typescript#module-augmentation.

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique object identifier. */
      id: number;
      /** The user's email address. */
      email: string;
    };
  }
}
