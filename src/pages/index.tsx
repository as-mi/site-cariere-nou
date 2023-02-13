import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import _ from "lodash";

import { PackageType } from "@prisma/client";

import { getSettingValue } from "~/lib/settings/get";

import NavBar from "~/components/pages/home/navbar";
import HeroSection from "~/components/pages/home/hero";
import LogosSection from "~/components/pages/home/logos";
import AboutSection from "~/components/pages/home/about";
import ContactSection from "~/components/pages/home/contact";
import Footer from "~/components/pages/home/footer";
import ScrollToTopButton from "~/components/pages/home/scroll-to-top";
import PartnersSection, {
  CompaniesByPackageType,
  Company,
} from "~/components/pages/home/partners";

import prisma from "~/lib/prisma";

type PageProps = {
  showComingSoonMessage: boolean;
  hideProfileLink: boolean;
  companiesByPackageType: CompaniesByPackageType;
};

const HomePage: NextPage<PageProps> = ({
  showComingSoonMessage,
  hideProfileLink,
  companiesByPackageType,
}) => {
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

      <NavBar t={t} hideProfileLink={hideProfileLink} />

      <main>
        <HeroSection t={t} showComingSoonMessage={showComingSoonMessage} />
        <LogosSection />
        <AboutSection t={t} />
        <PartnersSection
          t={t}
          showComingSoonMessage={showComingSoonMessage}
          companiesByPackageType={companiesByPackageType}
        />
        <ContactSection t={t} />
      </main>

      <Footer />

      <ScrollToTopButton />
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => {
  const ssrConfig = await serverSideTranslations(locale ?? "ro", [
    "common",
    "home",
  ]);

  const showComingSoonMessage = await getSettingValue("showComingSoonMessage");
  const showProfileLink = await getSettingValue("showProfileLink");
  const hideProfileLink = !showProfileLink;

  // When performing the initial static page build, we don't want to access the database
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return {
      props: {
        ...ssrConfig,
        showComingSoonMessage,
        hideProfileLink,
        companiesByPackageType: {},
      },
      // The page will be regenerated using the data from the database once the first request comes in
      revalidate: 1,
    };
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      packageType: true,
      logo: {
        select: {
          id: true,
          width: true,
          height: true,
        },
      },
    },
  });

  const companiesByPackageType = _.groupBy(companies, "packageType") as Partial<
    Record<PackageType, Company[]>
  >;

  return {
    props: {
      ...ssrConfig,
      showComingSoonMessage,
      hideProfileLink,
      companiesByPackageType,
    },
  };
};
