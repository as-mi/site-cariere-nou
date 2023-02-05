import { z } from "zod";

import { adminProcedure, router } from "../..";
import { EntityId } from "../../schema";

const Choice = z.object({
  id: z.number().int(),
  label: z.string(),
});

const QuestionType = z.enum(["shortText", "longText", "singleChoice"]);

const Question = z.object({
  id: z.number().int(),
  type: QuestionType,
  choices: z.array(Choice).optional(),
});

const CreateInput = z.object({
  positionId: EntityId,
  title: z.string(),
  description: z.string().default(""),
  questions: z.array(Question),
});

export const technicalTestRouter = router({
  create: adminProcedure.input(CreateInput).mutation(async ({}) => {
    throw new Error("Not yet implemented");
  }),
});
