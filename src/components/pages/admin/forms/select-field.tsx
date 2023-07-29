import { FieldValues } from "react-hook-form";

import classNames from "classnames";

import { CommonFieldProps, useFieldId } from "./common";

type Option<T> = { value: T; label: string };

export interface SelectFieldProps<
  T extends string,
  IFormValues extends FieldValues,
> extends CommonFieldProps<IFormValues> {
  hint?: string;
  options: Option<T>[];
  inputClassName?: string;
}

const SelectField = <T extends string, IFormValues extends FieldValues>({
  name,
  label,
  hint,
  options,
  required,
  register,
  errors,
  fieldErrors,
  inputClassName,
}: SelectFieldProps<T, IFormValues>) => {
  const selectId = useFieldId(name);
  const error = fieldErrors || (errors && errors[name]);
  return (
    <div>
      <label htmlFor={selectId} className="block">
        {label}
      </label>
      <select
        id={selectId}
        {...register(name, { required })}
        className={classNames(
          "block rounded-sm bg-zinc-800 px-2 py-1 text-white",
          inputClassName,
        )}
      >
        {options.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </select>
      {hint && <div className="mt-1 text-sm">{hint}</div>}
      {error && <div>{error?.message as string}</div>}
    </div>
  );
};

export default SelectField;
