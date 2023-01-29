import * as trpcNext from "@trpc/server/adapters/next";

import { appRouter } from "~/server/routers/_app";
import { createContext } from "~/server/context";

/**
 * Next.js API handler which forwards requests to tRPC.
 *
 * @see {@link https://trpc.io/docs/api-handler}
 */
const apiHandler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});

export default apiHandler;
