import { CreateNextContextOptions } from "@trpc/server/adapters/next";

import { getServerSession } from "~/lib/auth";

import { Context, createContextInner } from "./context";

export async function createContext({
  req,
  res,
}: CreateNextContextOptions): Promise<Context> {
  let user = null;

  const session = await getServerSession(req, res);

  if (session?.user) {
    user = {
      id: session.user.id,
      role: session.user.role,
    };
  }

  return await createContextInner({
    user,
    revalidate: res.revalidate,
  });
}
