import type { GetStaticProps } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import NavBar from "~/components/pages/home/navbar";
import HeroSection from "~/components/pages/home/hero";
import LogosSection from "~/components/pages/home/logos";
import AboutSection from "~/components/pages/home/about";
import ContactSection from "~/components/pages/home/contact";
import Footer from "~/components/pages/home/footer";
import ScrollToTopButton from "~/components/pages/home/scroll-to-top";
import PartnersSection from "~/components/pages/home/partners";

const PlaceholderSection = () => (
  <section className="flex min-h-screen items-center justify-center">
    <p className="text-5xl font-medium">Placeholder</p>
  </section>
);

const HomePage: React.FC = () => {
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
        <HeroSection t={t} />
        <LogosSection />
        <AboutSection t={t} />
        <PartnersSection t={t} />
        <ContactSection t={t} />
        {/* <PlaceholderSection /> */}
      </main>

      <Footer />

      <ScrollToTopButton />
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
    },
  };
};
