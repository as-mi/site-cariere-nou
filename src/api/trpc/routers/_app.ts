import { router } from "..";
import { commonRouter } from "./common";
import { participantRouter } from "./participant";
import { adminRouter } from "./admin";

export const appRouter = router({
  common: commonRouter,
  participant: participantRouter,
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
