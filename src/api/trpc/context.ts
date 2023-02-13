import { inferAsyncReturnType } from "@trpc/server";

import type { User } from "@prisma/client";

interface CreateContextOptions {
  /**
   * Object describing the currently logged-in user, or `null` if request is unauthenticated.
   */
  user: Pick<User, "id" | "role"> | null;
  /**
   * Regenerates an existing site page which supports Next.js' Incremental Site Generation.
   */
  revalidate: (urlPath: string) => Promise<void>;
}

/**
 * Inner function for `createContext` where we create the context.
 *
 * This is useful for testing, where we don't want to mock Next.js' request/response objects.
 */
export async function createContextInner(opts: CreateContextOptions) {
  return { ...opts };
}

export type Context = inferAsyncReturnType<typeof createContextInner>;
