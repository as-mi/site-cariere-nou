import { FieldValues } from "react-hook-form";

import classNames from "classnames";

import { CommonFieldProps, useFieldId } from "./common";

export interface TextAreaFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  placeholder?: string;
  hint?: string;
  className?: string;
}

const TextAreaField = <IFormValues extends FieldValues>({
  name,
  label,
  placeholder,
  hint,
  required,
  register,
  errors,
  className,
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
        className={classNames("block w-full bg-zinc-800 text-white", className)}
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
