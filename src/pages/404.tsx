import { GetStaticProps } from "next";

import Head from "next/head";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import CommonNavBar from "~/components/common/navbar";
import Footer from "~/components/common/footer";
import ContactSection from "~/components/pages/home/contact";

const NavBar: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <CommonNavBar
      renderLinks={() => (
        <>
          <li className="md:inline-block">
            <Link href="/" className="block px-5 py-3">
              {t("navbar.home")}
            </Link>
          </li>
          <li className="md:inline-block">
            <Link href="/profile" className="block px-5 py-3">
              {t("navbar.profile")}
            </Link>
          </li>
        </>
      )}
      autoHideLogo={false}
    />
  );
};

export default function Custom404() {
  const { t } = useTranslation("404");

  return (
    <>
      <Head>
        <title>{t("pageNotFound")}</title>
      </Head>
      <NavBar />

      <main>
        <div className=" bg-black py-80 text-center">
          <h1 className=" font-display text-2xl font-bold uppercase text-white xs:text-3xl sm:text-4xl md:text-5xl">
            {t("pageNotFound")}
          </h1>
          <p className=" mx-auto mt-5 max-w-lg px-5 text-white">
            {t("pageNotFoundText")}
          </p>
          <Link
            className=" mt-10 inline-block w-1/4 rounded-full bg-white px-5 py-2 font-medium text-black hover:bg-zinc-100 active:bg-zinc-200"
            href="/"
          >
            {t("goToHomePage")}
          </Link>
        </div>
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "404"])),
    },
  };
};
