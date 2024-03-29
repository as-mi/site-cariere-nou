import {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

import { useTranslation } from "next-i18next";

type InputProps<
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
> = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  name: TFieldName;
  register: UseFormRegister<TFieldValues>;
  registerOptions?: RegisterOptions<TFieldValues, TFieldName>;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  errors: FieldErrors<TFieldValues>;
  additionalErrorMessages?: React.ReactNode;
};

const Input = <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>,
>({
  id,
  label,
  type,
  name,
  register,
  registerOptions,
  required,
  minLength,
  maxLength,
  errors,
  additionalErrorMessages,
}: InputProps<TFieldValues, TFieldName>): JSX.Element => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col items-start">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register(name, {
          required,
          minLength,
          maxLength,
          ...registerOptions,
        })}
        aria-invalid={errors[name] ? true : false}
        className={`block w-full border p-2 ${
          errors[name] ? "outline outline-1 outline-red-400" : ""
        }`}
      />
      {errors[name]?.type === "required" && (
        <div role="alert" className="pt-1 pl-2 text-sm">
          {t("forms.required")}
        </div>
      )}
      {errors[name]?.type === "minLength" && (
        <div role="alert" className="pt-1 pl-2 text-sm">
          {t("forms.minLength", { length: minLength! })}
        </div>
      )}
      {errors[name]?.type === "maxLength" && (
        <div role="alert" className="pt-1 pl-2 text-sm">
          {t("forms.maxLength", { length: maxLength! })}
        </div>
      )}
      {additionalErrorMessages}
    </div>
  );
};

export default Input;
