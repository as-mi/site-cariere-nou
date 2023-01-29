import { FieldValues } from "react-hook-form";

import { CommonFieldProps, useFieldId } from "./common";

export interface InputFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  type: "text" | "email" | "password";
  hint?: string;
}

const InputField = <IFormValues extends FieldValues>({
  type,
  name,
  label,
  hint,
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

export type InputFieldPropsWithoutType<IFormValues extends FieldValues> = Omit<
  InputFieldProps<IFormValues>,
  "type"
>;

export default InputField;
