import { adminProcedure, router } from "../..";
import { EntityId } from "../../schema";

import { z } from "zod";

import { QuestionsSchema } from "~/lib/technical-tests-schema";
import prisma from "~/lib/prisma";

const ReadInput = z.object({
  id: EntityId,
});
const ReadOutput = z
  .object({
    id: EntityId,
    positionId: EntityId,
    title: z.string(),
    description: z.string(),
    questions: QuestionsSchema,
  })
  .strict()
  .or(z.null());
const CreateInput = z.object({
  positionId: EntityId,
  title: z.string(),
  description: z.string().default(""),
  questions: QuestionsSchema,
});
const UpdateInput = z.object({
  id: EntityId,
  title: z.string(),
  description: z.string().default(""),
  questions: QuestionsSchema,
});
const DeleteInput = z.object({
  id: EntityId,
});

export const technicalTestRouter = router({
  read: adminProcedure
    .input(ReadInput)
    .output(ReadOutput)
    .query(async ({ input }) => {
      const { id } = input;

      const technicalTest = await prisma.technicalTest.findUnique({
        where: { id },
      });
      if (!technicalTest) {
        return null;
      }

      const result = QuestionsSchema.safeParse(technicalTest.questions);
      if (!result.success) {
        throw new Error("Failed to parse questions JSON");
      }

      return {
        ...technicalTest,
        questions: result.data,
      };
    }),
  create: adminProcedure
    .input(CreateInput.strict())
    .mutation(async ({ input }) => {
      await prisma.technicalTest.create({
        data: input,
      });
    }),
  update: adminProcedure
    .input(UpdateInput.strict())
    .mutation(async ({ input }) => {
      const { id } = input;

      await prisma.technicalTest.update({
        where: { id },
        data: input,
      });
    }),
  delete: adminProcedure.input(DeleteInput).mutation(async ({ input }) => {
    const { id } = input;

    await prisma.technicalTest.delete({ where: { id } });
  }),
});
