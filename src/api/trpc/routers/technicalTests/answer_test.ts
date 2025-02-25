import prisma from "~/lib/prisma";
import { participantProcedure, router } from "../..";
import { z } from "zod";

const CreateInput = z.object({
  userId: z.number(),
  technicalTestId: z.number(),
  answers: z.string(),
  createdAt: z.string(),
});

export const technicalTestAnswersRouter = router({
  create: participantProcedure
    .input(CreateInput)
    .mutation(async ({ input }) => {
      const { userId, technicalTestId, answers, createdAt } = input;

      const convertedDate = new Date(createdAt);
      const jsonAnswers = JSON.parse(answers);

      try {
        await prisma.participantAnswersToTechnicalTest.create({
          data: {
            userId: userId,
            technicalTestId: technicalTestId,
            answers: jsonAnswers,
            createdAt: convertedDate,
          },
        });
      } catch (e) {
        console.error(e);
      }
    }),
});

export type TechnicalTestAnswersRouter = typeof technicalTestAnswersRouter;
