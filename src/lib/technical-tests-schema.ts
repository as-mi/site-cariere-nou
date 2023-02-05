import { z } from "zod";

const IdSchema = z.number().int();

const ChoiceSchema = z
  .object({
    id: IdSchema,
    label: z.string(),
  })
  .strict();

export enum QuestionType {
  SHORT_TEXT = "shortText",
  LONG_TEXT = "longText",
  SINGLE_CHOICE = "singleChoice",
}

export const QuestionSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    details: z.string().default(""),
    type: z.nativeEnum(QuestionType),
    choices: z.array(ChoiceSchema).optional(),
  })
  .strict();

export type Question = z.infer<typeof QuestionSchema>;

export const QuestionsSchema = z.array(QuestionSchema);
