import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormUnregister,
} from "react-hook-form";

import { Question } from "~/lib/technical-tests-schema";

export type EntityId = number;

export type Option = { value: EntityId; label: string };

export interface CommonFieldValues {
  company: Option;
  position: Option;
  title: string;
  description: string;
  questions: Question[];
}

export interface CommonUseFormProps {
  control: Control<CommonFieldValues>;
  register: UseFormRegister<CommonFieldValues>;
  unregister: UseFormUnregister<CommonFieldValues>;
  errors: FieldErrors<CommonFieldValues>;
}
