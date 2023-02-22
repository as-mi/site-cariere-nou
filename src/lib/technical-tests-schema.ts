import _ from "lodash";
import { z } from "zod";

const IdSchema = z.number().int();

const ChoiceSchema = z
  .object({
    id: IdSchema,
    label: z.string(),
  })
  .strict();

export enum QuestionKind {
  SHORT_TEXT = "shortText",
  LONG_TEXT = "longText",
  SINGLE_CHOICE = "singleChoice",
}

export const QuestionSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    details: z.string().default(""),
    kind: z.nativeEnum(QuestionKind),
    correctChoiceId: IdSchema.optional(),
    choices: z.array(ChoiceSchema).optional(),
  })
  .strict();

export type Question = z.infer<typeof QuestionSchema>;

export const QuestionsSchema = z.array(QuestionSchema);

export const AnswerSchema = z
  .object({
    questionId: IdSchema,
    value: z.string(),
  })
  .strict();

export type Answer = z.infer<typeof AnswerSchema>;

export const AnswersSchema = z.array(AnswerSchema);

/**
 * Removes sensitive data from the questions array,
 * before they get sent to the front end to be rendered.
 */
export function sanitizeQuestions(questions: Question[]) {
  questions.forEach((question) => {
    if (question.kind !== QuestionKind.SINGLE_CHOICE) {
      // Remove leftover choices array if question is no longer single choice
      delete question.choices;
    } else {
      delete question.correctChoiceId;
    }
  });
}

export function validateAnswers(answers: Answer[], questions: Question[]) {
  if (answers.length > questions.length) {
    throw new Error(
      "Received more answers than there are questions in the technical test"
    );
  } else if (answers.length < questions.length) {
    throw new Error(
      "Received less answers than there are questions in the technical test"
    );
  }

  const questionsById = _.keyBy(questions, (question) => question.id);

  for (const { questionId, value } of answers) {
    if (!value) {
      throw new Error(`Empty answer for question with ID ${questionId}`);
    }

    const question = questionsById[questionId];
    if (!question) {
      throw new Error(
        `Question with ID ${questionId} not found in technical test`
      );
    }

    if (question.kind === QuestionKind.SINGLE_CHOICE) {
      const valueInt = parseInt(value);
      if (Number.isNaN(valueInt)) {
        throw new Error(
          `Answer to question with ID ${questionId} is not a valid integer: '${value}'`
        );
      }

      const choicesIds = new Set(question.choices!.map((choice) => choice.id));

      if (!choicesIds.has(valueInt)) {
        throw new Error(
          `Answer to question with ID ${questionId} is not a valid choice from the list`
        );
      }
    }
  }
}
