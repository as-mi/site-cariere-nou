import { ReactElement, useMemo } from "react";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/auth/layout";
import prisma from "~/lib/prisma";

enum Status {
  INVALID_URL,
  INVALID_USER_ID,
  INVALID_TOKEN,
  EMAIL_ALREADY_VERIFIED,
  TOKEN_VERIFIED,
}

type VerifyEmailPageProps = {
  status: Status;
};

const VerifyEmailPage: NextPageWithLayout<VerifyEmailPageProps> = ({
  status,
}) => {
  const { t } = useTranslation("verifyEmail");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v13.0`, [t]);

  const failureStatus =
    status === Status.INVALID_URL ||
    status === Status.INVALID_USER_ID ||
    status === Status.INVALID_TOKEN;
  const successStatus =
    status === Status.EMAIL_ALREADY_VERIFIED ||
    status === Status.TOKEN_VERIFIED;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <h1 className="mb-2 font-display text-xl font-bold">{t("pageTitle")}</h1>
      {failureStatus && (
        <div className="space-y-2">
          <p className="font-semibold">
            {status === Status.INVALID_URL && t("invalidUrl")}
            {status === Status.INVALID_USER_ID && t("invalidUserId")}
            {status === Status.INVALID_TOKEN && t("invalidToken")}
          </p>
          <p>{t("pleaseRecheckUrl")}</p>
          <p>{t("manuallyCopyUrl")}</p>
        </div>
      )}
      {successStatus && (
        <>
          <p className="font-semibold">
            {status === Status.EMAIL_ALREADY_VERIFIED && t("alreadyVerified")}
            {status === Status.TOKEN_VERIFIED && t("tokenVerified")}
          </p>
          <Link
            href="/"
            className="mt-3 block font-semibold text-green-700 underline"
          >
            {t("backToHomePage")}
          </Link>
        </>
      )}
    </>
  );
};

export default VerifyEmailPage;

VerifyEmailPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps<
  VerifyEmailPageProps
> = async ({ query, locale }) => {
  const { id, token } = query;

  let status;
  if (
    id === undefined ||
    token === undefined ||
    typeof id !== "string" ||
    typeof token !== "string"
  ) {
    status = Status.INVALID_URL;
  } else {
    const userId = parseInt(id);
    if (Number.isNaN(userId)) {
      status = Status.INVALID_URL;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        status = Status.INVALID_USER_ID;
      } else {
        if (user.emailVerified) {
          status = Status.EMAIL_ALREADY_VERIFIED;
        } else if (
          user.emailVerificationToken === null ||
          user.emailVerificationToken !== token
        ) {
          status = Status.INVALID_TOKEN;
        } else {
          await prisma.user.update({
            where: { id: userId },
            data: {
              emailVerified: new Date(),
              emailVerificationToken: null,
            },
          });

          status = Status.TOKEN_VERIFIED;
        }
      }
    }
  }

  return {
    props: {
      status,
      ...(await serverSideTranslations(locale ?? "ro", [
        "common",
        "verifyEmail",
      ])),
    },
  };
};
