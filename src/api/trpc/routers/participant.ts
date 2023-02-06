import { participantProcedure, router } from "..";

import { z } from "zod";

import prisma from "~/lib/prisma";
import { AnswersSchema } from "~/lib/technical-tests-schema";

import { EntityId } from "../schema";

const ProfileUpdateInput = z.object({
  name: z.string(),
  phoneNumber: z.string(),
});
const ApplyToPositionInput = z.object({
  positionId: EntityId,
  resumeId: EntityId,
});
const AnswerTechnicalTestInput = z.object({
  technicalTestId: EntityId,
  answers: AnswersSchema,
});

export const participantRouter = router({
  profileUpdate: participantProcedure
    .input(ProfileUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const id = ctx.user!.id;
      const { name, phoneNumber } = input;

      await prisma.user.update({
        where: { id },
        data: {
          name,
          profile: {
            upsert: {
              create: {
                phoneNumber,
              },
              update: {
                phoneNumber,
              },
            },
          },
        },
      });
    }),
  resumeGetAll: participantProcedure.query(async ({ ctx }) => {
    const id = ctx.user!.id;

    return await prisma.resume.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        fileName: true,
      },
      orderBy: [{ id: "asc" }],
    });
  }),
  applyToPosition: participantProcedure
    .input(ApplyToPositionInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const { positionId, resumeId } = input;

      // Check that the user completed the active technical test for this position, if there is any
      const position = await prisma.position.findFirst({
        where: {
          id: positionId,
        },
        select: {
          activeTechnicalTestId: true,
        },
      });

      if (!position) {
        throw new Error("Position with provided ID not found");
      }

      if (position.activeTechnicalTestId) {
        const technicalTestId = position.activeTechnicalTestId;

        const answers =
          await prisma.participantAnswersToTechnicalTest.findUnique({
            where: {
              userId_technicalTestId: {
                userId,
                technicalTestId,
              },
            },
            select: {
              userId: true,
            },
          });

        if (!answers) {
          throw new Error(
            "Cannot apply to this position until technical test is completed"
          );
        }
      }

      // Check that the given resume ID exists and belongs to this participant
      const resume = await prisma.resume.findFirst({
        where: {
          userId,
          id: resumeId,
        },
        select: {
          id: true,
        },
      });

      if (!resume) {
        throw new Error(
          "Resume with provided ID not found for currently logged-in user"
        );
      }

      await prisma.participantApplyToPosition.create({
        data: {
          userId,
          positionId,
          resumeId,
        },
      });
    }),
  answerTechnicalTest: participantProcedure
    .input(AnswerTechnicalTestInput)
    .mutation(async ({ input }) => {
      const { technicalTestId, answers } = input;

      const technicalTest = await prisma.technicalTest.findUnique({
        where: { id: technicalTestId },
      });

      throw new Error("Not yet implemented");
    }),
});
