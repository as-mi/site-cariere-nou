import { ReactElement, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import type { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import queryString from "query-string";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import { NextPageWithLayout } from "../_app";
import Layout from "../../components/pages/auth/layout";
import Input from "../../components/forms/input";

type RegistrationFormProps = {
  onRegistrationSuccess: () => void;
};

type RegistrationData = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
  consent: boolean;
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegistrationSuccess,
}) => {
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
      };
      const body = JSON.stringify(payload);
      const options = {
        method: "POST",
        headers: {
          "Accept-Language": i18n.language,
          "Content-Type": "application/json",
        },
        body,
      };
      const response = await fetch("/api/auth/register", options);

      if (response.ok) {
        setError("");
        onRegistrationSuccess();
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {}

        let errorMessage;
        if (errorData) {
          console.error(errorData);
          const errorMessageKey = `errors.${errorData.error}`;
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
            errors={errors}
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

const RegistrationSuccessMessage: React.FC = () => {
  const { t } = useTranslation("register");

  return (
    <>
      <h2 className="mt-1 mb-3 font-display text-xl font-bold">
        <FontAwesomeIcon
          icon={faCheck}
          className="mr-3 h-4 w-4 text-green-800"
        />
        {t("registrationSuccess.title")}
      </h2>
      <p className="font-body sm:px-7">
        {t("registrationSuccess.verifyEmailMessage")}
      </p>
    </>
  );
};

const RegistrationPage: NextPageWithLayout = () => {
  const { t } = useTranslation("register");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v12.0`, [t]);

  const router = useRouter();
  const query = queryString.stringify(router.query);

  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="flex flex-col">
        <Link
          href={`/auth/login/email${query ? `?${query}` : ""}`}
          className="mb-3 self-start font-semibold text-green-700 underline"
        >
          {t("backToEmailLoginPage")}
        </Link>
        {registrationSucceeded ? (
          <RegistrationSuccessMessage />
        ) : (
          <RegistrationForm
            onRegistrationSuccess={() => setRegistrationSucceeded(true)}
          />
        )}
      </div>
    </>
  );
};

export default RegistrationPage;

RegistrationPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "register"])),
    },
  };
};
