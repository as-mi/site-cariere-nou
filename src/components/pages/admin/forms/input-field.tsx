import { FieldValues } from "react-hook-form";

import { CommonFieldProps, useFieldId } from "./common";

export interface InputFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  type: "text" | "email" | "password" | "file";
  placeholder?: string;
  hint?: string;
  accept?: string;
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
  register,
  errors,
}: InputFieldProps<IFormValues>) => {
  const inputId = useFieldId(name);
  return (
    <div>
      <label htmlFor={inputId} className="block">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        accept={accept}
        {...register(name, { required })}
        className="block bg-zinc-800 text-white"
      />
      {hint && <div className="mt-1 text-sm">{hint}</div>}
      {errors[name] &&
        (errors[name]?.type === "required" ? (
          <div>Câmp obligatoriu</div>
        ) : (
          <div>{errors[name]?.message as string}</div>
        ))}
    </div>
  );
};

export default InputField;