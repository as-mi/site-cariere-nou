import { FieldValues } from "react-hook-form";

import classNames from "classnames";

import { CommonFieldProps, useFieldId } from "./common";

export interface TextAreaFieldProps<IFormValues extends FieldValues>
  extends CommonFieldProps<IFormValues> {
  placeholder?: string;
  hint?: string;
  wrapperClassName?: string;
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
  fieldErrors,
  wrapperClassName,
  className,
}: TextAreaFieldProps<IFormValues>) => {
  const inputId = useFieldId(name);
  const error = fieldErrors || (errors && errors[name]);
  return (
    <div className={wrapperClassName}>
      <label htmlFor={inputId} className="block">
        {label}
      </label>
      <textarea
        id={inputId}
        placeholder={placeholder}
        {...register(name, { required })}
        className={classNames(
          "block w-full bg-zinc-800 px-2 py-1 text-white",
          className
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

export default TextAreaField;
