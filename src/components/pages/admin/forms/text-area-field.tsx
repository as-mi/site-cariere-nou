import { FieldValues } from "react-hook-form";

import { CommonFieldProps, useFieldId } from "./common";

export interface TextAreaFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  placeholder?: string;
  hint?: string;
}

const TextAreaField = <IFormValues extends FieldValues>({
  name,
  label,
  placeholder,
  hint,
  required,
  register,
  errors,
}: TextAreaFieldProps<IFormValues>) => {
  const inputId = useFieldId(name);
  return (
    <div>
      <label htmlFor={inputId} className="block">
        {label}
      </label>
      <textarea
        id={inputId}
        placeholder={placeholder}
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

export default TextAreaField;
