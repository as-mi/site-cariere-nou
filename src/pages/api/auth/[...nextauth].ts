import NextAuth from "next-auth";
import { authOptions } from "~/lib/next-auth-options";

export default NextAuth(authOptions);
