import { ReactElement, useMemo, useState } from "react";

import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import queryString from "query-string";

import { getSettingValue } from "~/lib/settings";

import RegistrationForm from "~/components/pages/auth/register/form";
import RegistrationSuccessMessage from "~/components/pages/auth/register/success-message";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/auth/layout";

type PageProps = {
  registrationDisabled: boolean;
};

const RegistrationPage: NextPageWithLayout<PageProps> = ({
  registrationDisabled,
}) => {
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
        {registrationDisabled ? (
          <p>{t("registrationDisabled")}</p>
        ) : registrationSucceeded ? (
          <RegistrationSuccessMessage />
        ) : (
          <RegistrationForm onSuccess={() => setRegistrationSucceeded(true)} />
        )}
      </div>
    </>
  );
};

export default RegistrationPage;

RegistrationPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  locale,
}) => {
  const registrationEnabled = getSettingValue("registrationEnabled");
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "register"])),
      registrationDisabled: !registrationEnabled,
    },
  };
};
