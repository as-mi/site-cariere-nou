import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

// We use `import type` because we want to ensure that
// we don't pull in back end code into the client bundle
import type { AppRouter } from "~/api/trpc/routers/_app";

import { getBaseUrl } from "./base-url";

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
});
