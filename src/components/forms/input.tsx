import {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

import { useTranslation } from "next-i18next";

type InputProps<IFormValues extends FieldValues> = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  name: Path<IFormValues>;
  register: UseFormRegister<IFormValues>;
  registerOptions?: RegisterOptions<IFormValues>;
  required: boolean;
  errors: FieldErrors<IFormValues>;
  additionalErrorMessages?: React.ReactNode;
};

const Input = <IFormValues extends FieldValues>({
  id,
  label,
  type,
  name,
  register,
  registerOptions,
  required,
  errors,
  additionalErrorMessages,
}: InputProps<IFormValues>): JSX.Element => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col items-start">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register(name, { required, ...registerOptions })}
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
          {t("forms.minLength", {
            length: registerOptions?.minLength as number,
          })}
        </div>
      )}
      {errors[name]?.type === "maxLength" && (
        <div role="alert" className="pt-1 pl-2 text-sm">
          {t("forms.maxLength", {
            length: registerOptions?.maxLength as number,
          })}
        </div>
      )}
      {additionalErrorMessages}
    </div>
  );
};

export default Input;
