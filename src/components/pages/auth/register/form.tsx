import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { useTranslation } from "next-i18next";

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  mustHaveAlpha,
  mustHaveDigit,
} from "~/lib/passwords";

import Input from "~/components/forms/input";

type RegistrationFormProps = {
  onSuccess: () => void;
};

type RegistrationData = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
  consent: boolean;
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const { t, i18n } = useTranslation("register");
  const { t: commonT, i18n: commonI18n } = useTranslation("common");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationData>();

  const onSubmit: SubmitHandler<RegistrationData> = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        consent: data.consent,
        language: i18n.language,
      };
      const body = JSON.stringify(payload);
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      };
      const response = await fetch("/api/auth/register", options);

      if (response.ok) {
        setError("");
        onSuccess();
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {}

        let errorMessage;
        if (errorData) {
          console.error(errorData);
          const errorMessageKey = `common:errors.${errorData.error}`;
          if (commonI18n.exists(errorMessageKey)) {
            errorMessage = commonT(errorMessageKey);
          }
        }

        if (!errorMessage) {
          errorMessage = commonT("errors.errorCode", { code: response.status });
        }

        setError(t("registrationError", { errorMessage })!);
      }
    } catch (e) {
      console.error(e);
      setError(commonT("errors.networkError")!);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`mb-3 text-left text-red-600 ${error ? "" : "hidden"}`}>
        {error}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label={t("registrationForm.email")}
            required
            register={register}
            errors={errors}
          />
          <Input
            id="name"
            name="name"
            type="text"
            label={t("registrationForm.name")}
            required
            register={register}
            errors={errors}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label={t("registrationForm.password")}
            required
            register={register}
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            registerOptions={{
              validate: {
                mustHaveDigit,
                mustHaveAlpha,
              },
            }}
            errors={errors}
            additionalErrorMessages={
              <>
                {errors.password?.type === "mustHaveDigit" && (
                  <div className="pt-1 pl-2 text-sm">
                    {t("registrationForm.passwordMustHaveDigits")}
                  </div>
                )}
                {errors.password?.type === "mustHaveAlpha" && (
                  <div className="pt-1 pl-2 text-sm">
                    {t("registrationForm.passwordMustHaveAlpha")}
                  </div>
                )}
              </>
            }
          />
          <Input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            label={t("registrationForm.passwordConfirmation")}
            required
            register={register}
            registerOptions={{
              validate: {
                match: (_, values) =>
                  values.password === values.passwordConfirmation,
              },
            }}
            errors={errors}
            additionalErrorMessages={
              errors.passwordConfirmation?.type === "match" && (
                <div className="pt-1 pl-2 text-sm">
                  {t("registrationForm.passwordsMustMatch")}
                </div>
              )
            }
          />

          <div>
            <input
              id="consent"
              type="checkbox"
              {...register("consent", { required: true })}
              className={`m-1 h-4 w-4 p-1 ${
                errors.consent ? "ring-1 ring-inset ring-red-400" : ""
              }`}
            />
            <label htmlFor="consent" className="font-medium">
              {t("registrationForm.consent")}
            </label>
            <div
              className={`pt-1 pl-2 text-sm ${
                errors.consent?.type === "required" ? "" : "hidden"
              }`}
            >
              {t("registrationForm.consentRequired")}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <input
            disabled={submitting}
            type="submit"
            value={t("registrationForm.submit")!}
            className="cursor-pointer rounded-full bg-blue-700 px-4 py-2 text-white disabled:cursor-default disabled:bg-blue-300"
          />
        </div>
      </form>
    </>
  );
};

export default RegistrationForm;
