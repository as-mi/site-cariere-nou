import { router } from "..";
import { commonRouter } from "./common";
import { participantRouter } from "./participant";
import { adminRouter } from "./admin";
import { testsAnswersRouter } from "./technicalTests";

export const appRouter = router({
  common: commonRouter,
  participant: participantRouter,
  admin: adminRouter,
  technicalTestAnswers: testsAnswersRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
