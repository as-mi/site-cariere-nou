import { publicProcedure, router } from "..";
import { participantRouter } from "./participant";
import { adminRouter } from "./admin";

export const appRouter = router({
  hello: publicProcedure.query(() => "Hello!"),
  participant: participantRouter,
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
