import { useId, useMemo } from "react";

import {
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

/**
 * A set of props all form fields must accept.
 */
export interface CommonFieldProps<IFormValues extends FieldValues> {
  name: Path<IFormValues>;
  label: string;
  required?: boolean;
  register: UseFormRegister<IFormValues>;
  errors?: FieldErrors<IFormValues>;
  fieldErrors?: FieldError;
}

/**
 * Generates an unique ID for a form field, which can be used for SSR.
 *
 * @param name field's name
 * @returns an opaque unique ID
 */
export const useFieldId = (name: string) => {
  const id = useId();
  return useMemo(() => `${name}-${id}`, [name, id]);
};
