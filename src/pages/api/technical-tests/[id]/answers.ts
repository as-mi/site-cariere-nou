import { z } from "zod";

import type { NextApiRequest, NextApiResponse } from "next";

import { Role } from "@prisma/client";

import { createHandler } from "~/api/handler";
import {
  BadRequestError,
  MethodNotAllowedError,
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
} from "~/api/errors";

import { getServerSession } from "~/lib/auth";
import prisma from "~/lib/prisma";
import { AnswersSchema, QuestionsSchema } from "~/lib/technical-tests-schema";
import { generateTechnicalTestAnswerSheet } from "~/lib/technical-tests-export";

const IdSchema = z.preprocess(
  (value) => parseInt(z.string().parse(value), 10),
  z.number().int()
);

const QueryStringSchema = z
  .object({
    id: IdSchema,
    userId: IdSchema.optional(),
  })
  .strict();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    throw new MethodNotAllowedError();
  }

  const session = await getServerSession(req, res);

  if (!session?.user) {
    throw new NotAuthenticatedError();
  }

  const result = QueryStringSchema.safeParse(req.query);

  if (!result.success) {
    throw new BadRequestError(
      "bad-request",
      `Failed to parse request query parameters: ${result.error.message}`
    );
  }

  const data = result.data;

  const technicalTestId = data.id;
  let userId = data.userId;

  if (session.user.role === Role.ADMIN) {
    if (userId === undefined) {
      throw new BadRequestError();
    }
  } else {
    if (userId !== undefined) {
      throw new NotAuthorizedError();
    }
    userId = session.user.id;
  }

  const technicalTest = await prisma.technicalTest.findUnique({
    where: { id: technicalTestId },
  });

  if (!technicalTest) {
    throw new NotFoundError(
      "not-found",
      "Technical test with provided ID was not found"
    );
  }

  const questions = QuestionsSchema.parse(technicalTest.questions);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("not-found", "User with given ID was not found");
  }

  const participantAnswers =
    await prisma.participantAnswersToTechnicalTest.findUnique({
      where: { userId_technicalTestId: { userId, technicalTestId } },
    });

  if (!participantAnswers) {
    throw new NotFoundError(
      "not-found",
      "Participant's answers to provided technical test were not found"
    );
  }

  const answers = AnswersSchema.parse(participantAnswers.answers);

  const answerSheetDocument = generateTechnicalTestAnswerSheet(
    userId,
    technicalTestId,
    technicalTest.title,
    questions,
    answers
  );

  answerSheetDocument.pipe(res);

  await new Promise(function (resolve) {
    answerSheetDocument.on("end", resolve);
  });
}

export default createHandler(handler);
