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

type ResetPasswordFormProps = {
  onSuccess: () => void;
};

type ResetPasswordData = {
  email: string;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
  const { t, i18n } = useTranslation("resetPassword");
  const { t: commonT, i18n: commonI18n } = useTranslation("common");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit: SubmitHandler<ResetPasswordData> = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        email: data.email,
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
      const response = await fetch("/api/auth/reset-password", options);

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

        setError(t("resetPasswordError", { errorMessage })!);
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
      <div className={`text-left text-red-600 ${error ? "" : "hidden"}`}>
        {error}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="my-3">
        <Input
          id="email"
          name="email"
          type="email"
          label={t("resetPasswordForm.email")}
          required
          register={register}
          errors={errors}
        />

        <div className="mt-6 text-center">
          <input
            disabled={submitting}
            type="submit"
            value={t("resetPasswordForm.submit")!}
            className="cursor-pointer whitespace-normal rounded-full bg-blue-700 px-4 py-2 text-white disabled:cursor-default disabled:bg-blue-300"
          />
        </div>
      </form>
    </>
  );
};

const ResetPasswordSuccessMessage: React.FC = () => {
  const { t } = useTranslation("resetPassword");

  return (
    <>
      <h2 className="mt-1 mb-3 font-display text-xl font-bold">
        <FontAwesomeIcon
          icon={faCheck}
          className="mr-3 h-4 w-4 text-green-800"
        />
        {t("resetPasswordEmailSent.title")}
      </h2>
      <p className="font-body sm:px-7">
        {t("resetPasswordEmailSent.checkYourInbox")}
      </p>
    </>
  );
};

const ResetPasswordPage: NextPageWithLayout = () => {
  const { t } = useTranslation("resetPassword");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v12.0`, [t]);

  const router = useRouter();
  const query = queryString.stringify(router.query);

  const [resetPasswordEmailSent, setResetPasswordEmailSent] = useState(false);

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
        {resetPasswordEmailSent ? (
          <ResetPasswordSuccessMessage />
        ) : (
          <ResetPasswordForm
            onSuccess={() => setResetPasswordEmailSent(true)}
          />
        )}
      </div>
    </>
  );
};

export default ResetPasswordPage;

ResetPasswordPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", [
        "common",
        "resetPassword",
      ])),
    },
  };
};
