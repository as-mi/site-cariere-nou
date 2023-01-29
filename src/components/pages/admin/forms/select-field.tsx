import { FieldValues } from "react-hook-form";

import { CommonFieldProps, useFieldId } from "./common";

type Option<T> = { value: T; label: string };

export interface SelectFieldProps<
  T extends string,
  IFormValues extends FieldValues
> extends CommonFieldProps<IFormValues> {
  options: Option<T>[];
}

const SelectField = <T extends string, IFormValues extends FieldValues>({
  name,
  label,
  options,
  required,
  register,
  errors,
}: SelectFieldProps<T, IFormValues>) => {
  const selectId = useFieldId(name);
  return (
    <div>
      <label htmlFor={selectId} className="block">
        {label}
      </label>
      <select
        id={selectId}
        {...register(name, { required })}
        className="block bg-zinc-800 text-white"
      >
        {options.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </select>
      {errors[name] && <div>{errors[name]?.message as string}</div>}
    </div>
  );
};

export default SelectField;
