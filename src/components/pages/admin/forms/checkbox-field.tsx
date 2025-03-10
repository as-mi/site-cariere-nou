import { FieldValues } from "react-hook-form";

import { CommonFieldProps, useFieldId } from "./common";

export interface CheckboxFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  hint?: string;
  wrapperClassName?: string;
}

const CheckboxField = <IFormValues extends FieldValues>({
  name,
  label,
  hint,
  required,
  register,
  errors,
  fieldErrors,
  wrapperClassName,
}: CheckboxFieldProps<IFormValues>) => {
  const inputId = useFieldId(name);
  const error = fieldErrors || (errors && errors[name]);
  return (
    <div className={wrapperClassName}>
      <span className="align-baseline">
        <input
          id={inputId}
          type="checkbox"
          {...register(name, { required })}
          className="mr-2 inline hover:cursor-pointer"
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

export default CheckboxField;
