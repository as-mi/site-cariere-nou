import { publicProcedure, router } from "..";
import { adminRouter } from "./admin";

export const appRouter = router({
  hello: publicProcedure.query(() => "Hello!"),
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
