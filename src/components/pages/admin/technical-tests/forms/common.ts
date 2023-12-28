import { Question } from "~/lib/technical-tests-schema";

export type EntityId = number;

export type Option = { value: EntityId; label: string };

export interface CommonFieldValues {
  company: Option | null;
  position: Option | null;
  title: string;
  description: string;
  questions: Question[];
}
