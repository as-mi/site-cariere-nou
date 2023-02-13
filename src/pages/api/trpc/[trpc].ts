import * as trpcNext from "@trpc/server/adapters/next";

import { appRouter } from "~/api/trpc/routers/_app";
import { createContext } from "~/api/trpc/context-next";

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
