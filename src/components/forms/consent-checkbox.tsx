import { useId } from "react";
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

import { useTranslation } from "next-i18next";

type ConsentCheckboxProps<
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>
> = {
  name: TFieldName;
  label: string | JSX.Element;
  register: UseFormRegister<TFieldValues>;
  required?: boolean;
  fieldErrors?: FieldError;
};

const ConsentCheckbox = <
  TFieldValues extends FieldValues,
  TFieldName extends Path<TFieldValues>
>({
  name,
  label,
  register,
  required,
  fieldErrors,
}: ConsentCheckboxProps<TFieldValues, TFieldName>): JSX.Element => {
  const { t } = useTranslation("common");

  const id = useId();
  const inputId = `consent-${id}`;

  return (
    <div>
      <input
        id={inputId}
        type="checkbox"
        {...register(name, { required })}
        className={`m-1 h-4 w-4 p-1 ${
          fieldErrors ? "ring-1 ring-inset ring-red-400" : ""
        }`}
      />
      <label htmlFor={inputId} className="font-medium">
        {label}
      </label>
      <div
        className={`pt-1 pl-2 text-sm ${
          fieldErrors?.type === "required" ? "" : "hidden"
        }`}
      >
        {t("forms.consentRequired")}
      </div>
    </div>
  );
};

export default ConsentCheckbox;
