import { z } from "zod";

import { PaginationParamsSchema } from "~/api/pagination";
import { QuestionsSchema } from "~/lib/technical-tests-schema";
import prisma from "~/lib/prisma";

import { adminProcedure, router } from "../..";
import { EntityId } from "../../schema";

const GetAllInput = z.object({ positionId: EntityId });
const ReadInput = z.object({ id: EntityId });
const ReadManyInput = PaginationParamsSchema;
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
  getAll: adminProcedure.input(GetAllInput).query(async ({ input }) => {
    const { positionId } = input;

    const technicalTests = await prisma.technicalTest.findMany({
      where: { positionId },
      select: {
        id: true,
        title: true,
      },
    });
    return technicalTests;
  }),
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
  readMany: adminProcedure.input(ReadManyInput).query(async ({ input }) => {
    const { pageIndex, pageSize } = input;
    const skip = pageIndex * pageSize;
    const take = pageSize;

    const technicalTestsCount = await prisma.technicalTest.count();
    const pageCount = Math.ceil(technicalTestsCount / pageSize);

    const technicalTests = await prisma.technicalTest.findMany({
      select: {
        id: true,
        title: true,
        position: {
          select: {
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        activePosition: {
          select: {
            id: true,
          },
        },
      },
      skip,
      take,
      orderBy: [{ id: "asc" }],
    });

    return {
      pageCount,
      results: technicalTests,
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
