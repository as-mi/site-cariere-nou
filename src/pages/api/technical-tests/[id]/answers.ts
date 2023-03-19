import _ from "lodash";
import { z } from "zod";

import type { NextApiRequest, NextApiResponse } from "next";

import PDFDocument from "pdfkit";

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
import {
  AnswersSchema,
  QuestionKind,
  QuestionsSchema,
} from "~/lib/technical-tests-schema";

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
  const answersByQuestionId = _.mapValues(
    _.keyBy(answers, (answer) => answer.questionId),
    (answer) => answer.value
  );

  const doc = new PDFDocument({
    size: "A4",
    lang: "ro",
    info: {
      Title: `Răspunsuri candidat #${userId} la testul tehnic #${technicalTestId}`,
    },
  });

  const filterDiacritics = (text: string) =>
    text.replace(/ă|â/g, "a").replace(/î/g, "i");

  const originalTextMethod = doc.text;
  doc.text = (text: string, x?: any, y?: any, options?: any) =>
    (originalTextMethod as any).call(
      doc,
      filterDiacritics(text),
      x,
      y,
      options
    );

  doc.pipe(res);

  doc.fontSize(18);
  doc.font("Helvetica-Bold");
  doc.text(technicalTest.title);
  doc.fontSize(12);
  doc.font("Helvetica");

  doc.moveDown();
  doc.moveDown();

  let correctMarkedQuestions = 0;
  let totalMarkedQuestions = 0;
  questions.forEach(({ id, correctChoiceId }) => {
    if (!correctChoiceId) {
      return;
    }

    totalMarkedQuestions += 1;

    const answer = answersByQuestionId[id];
    const choiceId = Number(answer);
    if (choiceId === correctChoiceId) {
      correctMarkedQuestions += 1;
    }
  });

  if (totalMarkedQuestions > 0) {
    doc.text(
      `Participantul a răspuns corect la ${correctMarkedQuestions} din ${totalMarkedQuestions} întrebări de tip grilă (la care au fost configurate răspunsurile corecte).`
    );
    doc.moveDown();
    doc.moveDown();
  }

  questions.forEach((question, index) => {
    doc.text(`Răspunsul la întrebarea #${index + 1}:`);
    doc.moveDown();

    const answer = answersByQuestionId[question.id];

    doc.fillColor("#444");
    switch (question.kind) {
      case QuestionKind.SHORT_TEXT:
      case QuestionKind.LONG_TEXT:
        doc.text(answer, { indent: 20 });
        break;
      case QuestionKind.SINGLE_CHOICE:
        const choiceId = Number(answer);
        const choice = question.choices!.find(
          (choice) => choice.id === choiceId
        );
        doc.text(choice!.label, { indent: 20 });
        break;

      default:
        throw new Error(`Unknown question kind: ${question.kind}`);
    }
    doc.fillColor("black");

    if (question.correctChoiceId) {
      doc.moveDown();

      const choiceId = Number(answer);
      if (question.correctChoiceId === choiceId) {
        doc.fillColor("green").text("Raspunsul este cel corect");
      } else {
        doc.fillColor("red").text("Raspunsul nu este cel corect");
      }
      doc.fillColor("black");
    }

    doc.moveDown();
    doc.moveDown();
  });

  doc.end();

  await new Promise(function (resolve) {
    doc.on("end", resolve);
  });
}

export default createHandler(handler);
