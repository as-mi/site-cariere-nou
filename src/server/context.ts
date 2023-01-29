import trpcNext from "@trpc/server/adapters/next";

import { User } from "@prisma/client";

import { unstable_getServerSession } from "next-auth";
import { authOptions } from "~/lib/next-auth-options";

export type Context = {
  user: Pick<User, "id" | "role"> | null;
};

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions): Promise<Context> {
  let user = null;

  const session = await unstable_getServerSession(req, res, authOptions);

  if (session?.user) {
    user = {
      id: session.user.id,
      role: session.user.role,
    };
  }

  return {
    user,
  };
}
