import { participantProcedure, router } from "..";

import { z } from "zod";

import { getSettingValue } from "~/lib/settings/get";

import prisma from "~/lib/prisma";
import { PHONE_NUMBER_PATTERN } from "~/lib/phone-numbers";
import {
  AnswersSchema,
  QuestionsSchema,
  validateAnswers,
} from "~/lib/technical-tests-schema";

import { EntityId } from "../schema";

const ProfileUpdateInput = z.object({
  name: z.string().trim(),
  phoneNumber: z.string().trim().regex(PHONE_NUMBER_PATTERN),
});

const OptionsUpdateInput = z.object({
  applyToOtherPartners: z.boolean(),
});

const ResumeDeleteInput = z.object({
  id: EntityId,
});

const ApplyToPositionInput = z.object({
  positionId: EntityId,
  resumeId: EntityId,
});
const WithdrawFromPositionInput = z.object({
  positionId: EntityId,
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
      let { name, phoneNumber } = input;

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
  optionsGet: participantProcedure.query(async ({ ctx }) => {
    const id = ctx.user!.id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { consentApplyToOtherPartners: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      applyToOtherPartners: user.consentApplyToOtherPartners,
    };
  }),
  optionsUpdate: participantProcedure
    .input(OptionsUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const id = ctx.user!.id;

      await prisma.user.update({
        where: { id },
        data: {
          consentApplyToOtherPartners: input.applyToOtherPartners,
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
  resumeDelete: participantProcedure
    .input(ResumeDeleteInput)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.user!.id;

      const applicationsClosed = await getSettingValue("closeApplications");
      if (applicationsClosed) {
        throw new Error(
          "Application period has ended, resumes cannot be deleted anymore"
        );
      }

      const resume = await prisma.resume.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!resume) {
        throw new Error("Resume with provided ID not found");
      }

      await prisma.resume.delete({
        where: {
          id,
        },
      });
    }),
  applyToPosition: participantProcedure
    .input(ApplyToPositionInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const { positionId, resumeId } = input;

      const allowParticipantsToApplyToPositions = await getSettingValue(
        "allowParticipantsToApplyToPositions"
      );
      if (!allowParticipantsToApplyToPositions) {
        throw new Error("Applications are currently disabled");
      }

      const applicationsClosed = await getSettingValue("closeApplications");
      if (applicationsClosed) {
        throw new Error("Application period has ended");
      }

      // Check that the user completed the active technical test for this position, if there is any
      const position = await prisma.position.findFirst({
        where: {
          id: positionId,
        },
        select: {
          activeTechnicalTestId: true,
          technicalTestIsMandatory: true,
        },
      });

      if (!position) {
        throw new Error("Position with provided ID not found");
      }

      if (position.activeTechnicalTestId && position.technicalTestIsMandatory) {
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
  withdrawFromPosition: participantProcedure
    .input(WithdrawFromPositionInput)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const { positionId } = input;

      await prisma.participantApplyToPosition.delete({
        where: {
          userId_positionId: { userId, positionId },
        },
      });
    }),
  answerTechnicalTest: participantProcedure
    .input(AnswerTechnicalTestInput)
    .mutation(async ({ input, ctx: { user } }) => {
      const { technicalTestId, answers } = input;

      const technicalTest = await prisma.technicalTest.findUnique({
        where: { id: technicalTestId },
        select: {
          questions: true,
        },
      });
      if (!technicalTest) {
        throw new Error("Technical test with provided ID not found");
      }

      const result = QuestionsSchema.safeParse(technicalTest.questions);
      if (!result.success) {
        throw new Error(
          "Failed to parse questions from technical test for validation"
        );
      }

      const questions = result.data;
      validateAnswers(answers, questions);

      await prisma.participantAnswersToTechnicalTest.create({
        data: {
          userId: user!.id,
          technicalTestId,
          answers,
        },
      });
    }),
});
