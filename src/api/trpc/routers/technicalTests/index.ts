import { router } from "../..";

import { technicalTestAnswersRouter } from "./answer_test";

export const testsAnswersRouter = router({
  technicalTestAnswers: technicalTestAnswersRouter,
});

export type TestsAnswersRouter = typeof testsAnswersRouter;
