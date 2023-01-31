import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import _ from "lodash";

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
import { PackageType } from "@prisma/client";

type PageProps = {
  companiesByPackageType: CompaniesByPackageType;
};

const HomePage: NextPage<PageProps> = ({ companiesByPackageType }) => {
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
        <PartnersSection
          t={t}
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
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
      companiesByPackageType,
    },
  };
};
