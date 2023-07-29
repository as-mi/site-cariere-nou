import { FieldValues } from "react-hook-form";

import classNames from "classnames";

import { CommonFieldProps, useFieldId } from "./common";

export interface InputFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  type: "text" | "number" | "email" | "password" | "file" | "date";
  placeholder?: string;
  hint?: string;
  accept?: string;
  valueAsNumber?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
}

export type SpecializedInputFieldProps<IFormValues extends FieldValues> = Omit<
  InputFieldProps<IFormValues>,
  "type" | "accept"
>;

const InputField = <IFormValues extends FieldValues>({
  type,
  name,
  label,
  placeholder,
  hint,
  accept,
  required,
  valueAsNumber,
  register,
  errors,
  fieldErrors,
  wrapperClassName,
  inputClassName,
}: InputFieldProps<IFormValues>) => {
  const inputId = useFieldId(name);
  const error = fieldErrors || (errors && errors[name]);
  return (
    <div className={wrapperClassName}>
      <label htmlFor={inputId} className="block">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        accept={accept}
        {...register(name, { required, valueAsNumber })}
        className={classNames(
          "block rounded-sm bg-zinc-800 px-2 py-1 text-white",
          { "w-full": !inputClassName },
          inputClassName,
        )}
      />
      {hint && <div className="mt-1 text-sm">{hint}</div>}
      {error &&
        (error?.type === "required" ? (
          <div>Câmp obligatoriu</div>
        ) : (
          <div>{error?.message as string}</div>
        ))}
    </div>
  );
};

export default InputField;
