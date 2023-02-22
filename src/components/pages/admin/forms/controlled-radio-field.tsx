import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

import { useFieldId } from "./common";

export interface ControlledRadioFieldProps<T, IFormValues extends FieldValues> {
  control: Control<IFormValues>;
  name: Path<IFormValues>;
  label: string;
  value: T;
  hint?: string;
  errors?: FieldErrors<IFormValues>;
  fieldErrors?: FieldError;
  wrapperClassName?: string;
}

/**
 * A radio button field which can handle values of arbitrary type.
 */
const ControlledRadioField = <T, IFormValues extends FieldValues>({
  control,
  name,
  label,
  value,
  hint,
  errors,
  fieldErrors,
  wrapperClassName,
}: ControlledRadioFieldProps<T, IFormValues>) => {
  const inputId = useFieldId(name);
  const error = fieldErrors || (errors && errors[name]);
  return (
    <div className={wrapperClassName}>
      <span className="align-baseline">
        <Controller
          control={control}
          name={name}
          render={({
            field: { onChange, onBlur, value: fieldValue, name, ref },
          }) => (
            <input
              id={inputId}
              name={name}
              type="radio"
              checked={fieldValue === undefined ? false : fieldValue === value}
              onChange={() => onChange(value)}
              onBlur={onBlur}
              ref={ref}
              className="mr-2 inline"
            />
          )}
        />

        <label htmlFor={inputId} className="inline">
          {label}
        </label>
      </span>
      {hint && <div className="mt-1 text-sm">{hint}</div>}
      {error && <div>{error?.message as string}</div>}
    </div>
  );
};

export default ControlledRadioField;
