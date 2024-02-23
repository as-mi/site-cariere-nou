import { ReactElement, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import queryString from "query-string";

import { getSettingValue } from "~/lib/settings/get";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/auth/layout";
import Input from "~/components/forms/input";

type Credentials = {
  email: string;
  password: string;
};

type PageProps = {
  showRegistrationLink: boolean;
};

const EmailLoginPage: NextPageWithLayout<PageProps> = ({
  showRegistrationLink,
}) => {
  const { t } = useTranslation("emailLogin");
  const { t: commonT, i18n: commonI18n } = useTranslation("common");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v12.0`, [t]);

  const router = useRouter();
  const query = queryString.stringify(router.query);

  const rawCallbackUrl =
    (Array.isArray(router.query.callbackUrl)
      ? router.query.callbackUrl[0]
      : router.query.callbackUrl) || "/";

  // Get rid of '<', '>', "'" and '"' characters to prevent DOM-based cross-site scripting attacks.
  const callbackUrl = rawCallbackUrl.replaceAll(/<|>|'|"/g, "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>();

  const onSubmit: SubmitHandler<Credentials> = async (data) => {
    setSubmitting(true);
    setError("");

    try {
      const options = {
        callbackUrl,
        redirect: false,
        ...data,
      };
      const result = await signIn("credentials", options);

      if (result === undefined || !result.ok) {
        let errorMessage;
        if (result) {
          const errorMessageKey = `common:errors.${result.error}`;
          if (commonI18n.exists(errorMessageKey)) {
            errorMessage = commonT(errorMessageKey);
          }
        }

        let errorText = t("loginForm.error")!;
        if (errorMessage) {
          errorText += ": " + errorMessage;
        }
        setError(errorText);
      } else {
        router.push(callbackUrl);
      }
    } catch (e) {
      console.error(e);
      setError(commonT("errors.networkError")!);
    } finally {
      setSubmitting(false);
    }
  };

  // Ensure callback URL is relative to avoid malicious redirects to phishing sites.
  if (!rawCallbackUrl.startsWith("/")) {
    return <p>Invalid callback URL</p>;
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="flex flex-col">
        <Link
          href={`/auth/login${query ? `?${query}` : ""}`}
          className="mb-3 self-start font-semibold text-green-700 underline"
        >
          {t("backToLoginPage")}
        </Link>
        <div className={`text-left text-red-600 ${error ? "" : "hidden"}`}>
          {error}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="my-3">
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label={t("loginForm.email")}
              required
              register={register}
              errors={errors}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label={t("loginForm.password")}
              required
              register={register}
              errors={errors}
            />
          </div>

          <div className="mt-6 text-center">
            <input
              disabled={submitting}
              type="submit"
              value={t("loginForm.submit") || "Submit"}
              className="cursor-pointer rounded-full bg-blue-700 px-4 py-2 text-white disabled:cursor-default disabled:bg-blue-300"
            />
          </div>
        </form>
        <div className="flex flex-col items-center justify-around">
          {showRegistrationLink && (
            <Link
              href={`/auth/register${query ? `?${query}` : ""}`}
              className="block text-green-700 hover:text-green-600"
            >
              {t("register")}
            </Link>
          )}
          <Link
            href={`/auth/reset-password${query ? `?${query}` : ""}`}
            className="block text-green-700 hover:text-green-600"
          >
            {t("resetPassword")}
          </Link>
        </div>
      </div>
    </>
  );
};

export default EmailLoginPage;

EmailLoginPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  locale,
}) => {
  const registrationEnabled = await getSettingValue("registrationEnabled");
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", [
        "common",
        "emailLogin",
      ])),
      showRegistrationLink: registrationEnabled,
    },
  };
};
