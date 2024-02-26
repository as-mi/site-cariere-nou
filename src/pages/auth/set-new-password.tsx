import { ReactElement, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import { NextPageWithLayout } from "../_app";
import Layout from "../../components/pages/auth/layout";
import Input from "../../components/forms/input";

type SetNewPasswordFormProps = {
  userId: number;
  token: string;
  onSuccess: () => void;
};

type SetNewPasswordData = {
  newPassword: string;
  newPasswordConfirmation: string;
};

const SetNewPasswordForm: React.FC<SetNewPasswordFormProps> = ({
  userId,
  token,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation("setNewPassword");
  const { t: commonT, i18n: commonI18n } = useTranslation("common");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetNewPasswordData>();

  const onSubmit: SubmitHandler<SetNewPasswordData> = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        userId,
        token,
        newPassword: data.newPassword,
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
      const response = await fetch("/api/auth/set-new-password", options);

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

        setError(t("setNewPasswordError", { errorMessage })!);
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
            id="newPassword"
            name="newPassword"
            type="password"
            label={t("setNewPasswordForm.newPassword")}
            required
            register={register}
            errors={errors}
          />
          <Input
            id="newPasswordConfirmation"
            name="newPasswordConfirmation"
            type="password"
            label={t("setNewPasswordForm.newPasswordConfirmation")}
            required
            register={register}
            registerOptions={{
              validate: {
                match: (_, values) =>
                  values.newPassword === values.newPasswordConfirmation,
              },
            }}
            errors={errors}
            additionalErrorMessages={
              errors.newPasswordConfirmation?.type === "match" && (
                <div className="pt-1 pl-2 text-sm">
                  {t("setNewPasswordForm.passwordsMustMatch")}
                </div>
              )
            }
          />
        </div>
        <div className="mt-6 text-center">
          <input
            disabled={submitting}
            type="submit"
            value={t("setNewPasswordForm.submit")!}
            className="cursor-pointer rounded-full bg-blue-700 px-4 py-2 text-white disabled:cursor-default disabled:bg-blue-300"
          />
        </div>
      </form>
    </>
  );
};

const PasswordUpdatedMessage: React.FC = () => {
  const { t } = useTranslation("setNewPassword");

  return (
    <>
      <h2 className="mt-1 mb-3 font-display text-xl font-bold">
        <FontAwesomeIcon
          icon={faCheck}
          className="mr-3 h-4 w-4 text-green-800"
        />
        {t("passwordUpdated.title")}
      </h2>
      <p className="font-body sm:px-7">{t("passwordUpdated.message")}</p>
      <Link
        href="/auth/login/email"
        className="mt-3 inline-block self-start font-semibold text-green-700 underline"
      >
        {t("passwordUpdated.backToEmailLoginPage")}
      </Link>
    </>
  );
};

type SetNewPasswordPageProps = {
  invalidUrl: boolean;
  userId?: number;
  token?: string;
};

const SetNewPasswordPage: NextPageWithLayout<SetNewPasswordPageProps> = ({
  invalidUrl,
  userId,
  token,
}) => {
  const { t } = useTranslation("setNewPassword");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v13.0`, [t]);

  const [passwordUpdated, setPasswordUpdated] = useState(false);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <h1 className="mb-2 font-display text-xl font-bold">{t("pageTitle")}</h1>

      {invalidUrl ? (
        <div className="space-y-2">
          <p className="font-semibold">{t("invalidUrl")}</p>
          <p>{t("pleaseRecheckUrl")}</p>
        </div>
      ) : passwordUpdated ? (
        <PasswordUpdatedMessage />
      ) : (
        <SetNewPasswordForm
          userId={userId!}
          token={token as string}
          onSuccess={() => setPasswordUpdated(true)}
        />
      )}
    </>
  );
};

export default SetNewPasswordPage;

SetNewPasswordPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps<
  SetNewPasswordPageProps
> = async ({ query, locale }) => {
  let invalidUrl = false;
  let userId: number | undefined;
  let token: string | undefined;
  if (
    !query.id ||
    !query.token ||
    !(typeof query.id === "string") ||
    !(typeof query.token === "string")
  ) {
    invalidUrl = true;
  } else {
    userId = parseInt(query.id);
    if (Number.isNaN(userId)) {
      invalidUrl = true;
      userId = undefined;
      token = undefined;
    } else {
      token = query.token;
    }
  }

  return {
    props: {
      invalidUrl,
      userId,
      token,
      ...(await serverSideTranslations(locale ?? "ro", [
        "common",
        "setNewPassword",
      ])),
    },
  };
};
