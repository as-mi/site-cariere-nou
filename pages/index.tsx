import type { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const NavBar = () => (
  <header className="fixed px-2 py-3">
    <nav>
      <Image
        src="/assets/images/logos/cariere-small-white.png"
        alt="Logo Cariere"
        width={98}
        height={40}
      />
    </nav>
  </header>
);

const Home: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <>
      <Head>
        <title>Cariere v12.0</title>
        <meta
          name="description"
          content="Cariere este un târg de job-uri și internship-uri dedicat studenților"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main>
        <section className="min-h-screen bg-black pt-32 text-white">
          <div className="text-center">
            {/** TODO: replace with Cariere v12 logo */}
            <Image
              className="mx-auto"
              src="/assets/images/logos/cariere-white.png"
              alt="Cariere v10.0"
              width={350}
              height={112.66}
            />

            <a className="mt-16 inline-block rounded-full bg-white px-5 py-2 font-medium text-black">
              {t("about")}
            </a>
          </div>
        </section>
        <section className="flex min-h-screen items-center justify-center">
          <p className="text-5xl font-medium">Placeholder</p>
        </section>
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
    },
  };
};
