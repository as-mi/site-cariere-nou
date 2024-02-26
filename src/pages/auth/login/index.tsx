import { ReactElement, useMemo } from "react";

import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

import { signIn, getProviders } from "next-auth/react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import queryString from "query-string";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/auth/layout";
import { getSettingValue } from "~/lib/settings/get";

type PageProps = {
  showSocialLoginButtons: boolean;
  availableProviders: string[];
};

const LoginPage: NextPageWithLayout<PageProps> = ({
  showSocialLoginButtons,
  availableProviders,
}) => {
  const { t } = useTranslation("login");

  const pageTitle = useMemo(() => `${t("pageTitle")} - Cariere v13.0`, [t]);

  const router = useRouter();
  const query = queryString.stringify(router.query);

  const error = router.query["error"];

  const isAuthenticationBeingRequired = !!router.query.hasOwnProperty(
    "authenticationRequired",
  );
  const callbackUrl =
    (Array.isArray(router.query.callbackUrl)
      ? router.query.callbackUrl[0]
      : router.query.callbackUrl) || "/";

  const canSignInWithGoogle = !!availableProviders.find(
    (providerId) => providerId === "google",
  );
  const canSignInWithFacebook = !!availableProviders.find(
    (providerId) => providerId === "facebook",
  );

  const handleSignInWithGoogle = () => {
    signIn("google", { callbackUrl });
  };

  const handleSignInWithFacebook = () => {
    signIn("facebook", { callbackUrl });
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="text-center">
        <header className="mb-3">
          <h1 className="font-display text-3xl font-bold">
            {t("loginForm.title")}
          </h1>
          <div className={error ? "" : "hidden"}>
            <p className="my-3 rounded-lg bg-red-200 px-3 py-3 text-sm font-semibold text-black">
              {error === "OAuthAccountNotLinked"
                ? t("loginForm.errors.accountNotLinked")
                : t("loginForm.errors.authenticationError")}
            </p>
          </div>
          <div className={isAuthenticationBeingRequired ? "" : "hidden"}>
            <p className="my-3 rounded-lg bg-amber-300 px-3 py-3 text-sm font-semibold text-black">
              {t("loginForm.warnings.authenticationRequired")}
            </p>
          </div>
        </header>

        <div className="flex flex-col space-y-3">
          {showSocialLoginButtons && (
            <>
              <button
                disabled={!canSignInWithGoogle}
                onClick={
                  canSignInWithGoogle ? handleSignInWithGoogle : undefined
                }
                title={
                  canSignInWithGoogle
                    ? ""
                    : t("authenticationProviders.notAvailable") || undefined
                }
                className="block rounded-md border-2 border-solid border-blue-300 bg-blue-500 px-3 py-2 text-white hover:ring-2 hover:ring-blue-300"
              >
                <FontAwesomeIcon
                  icon={faGoogle}
                  className="mr-2 inline-block h-4 w-4"
                />{" "}
                {t("authenticationProviders.google")}
              </button>
              <button
                disabled={!canSignInWithFacebook}
                onClick={
                  canSignInWithFacebook ? handleSignInWithFacebook : undefined
                }
                title={
                  canSignInWithFacebook
                    ? ""
                    : t("authenticationProviders.notAvailable") || undefined
                }
                className="block rounded-md border-2 border-solid border-sky-600 bg-sky-800 px-3 py-2 text-white hover:ring-2 hover:ring-sky-300"
              >
                <FontAwesomeIcon
                  icon={faFacebook}
                  className="mr-2 inline-block h-4 w-4"
                />{" "}
                {t("authenticationProviders.facebook")}
              </button>
            </>
          )}
          <Link
            href={`/auth/login/email${query ? `?${query}` : ""}`}
            className="border-gray block rounded-md border-2 border-solid px-3 py-2"
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              className="mr-2 inline-block h-4 w-4"
            />{" "}
            {t("authenticationProviders.email")}
          </Link>
        </div>
      </div>
    </>
  );
};

LoginPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default LoginPage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const ssrConfig = await serverSideTranslations(locale ?? "ro", [
    "common",
    "login",
  ]);

  // When performing the initial static page build,
  // we don't want do dynamically query the list of providers from the backend
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return {
      props: {
        ...ssrConfig,
        showSocialLoginButtons: false,
        availableProviders: [],
      },
      // The page will be regenerated using the active list of providers
      // once the first request comes in
      revalidate: 1,
    };
  }

  const providers = await getProviders();

  const availableProviders =
    providers === null
      ? []
      : Object.values(providers).map((provider) => provider.id);

  const enableSocialLogin = await getSettingValue("enableSocialLogin");

  return {
    props: {
      ...ssrConfig,
      showSocialLoginButtons: enableSocialLogin,
      availableProviders,
    },
    revalidate: 30,
  };
};
