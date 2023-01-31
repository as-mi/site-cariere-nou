import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { PackageType } from "@prisma/client";

import showdown from "showdown";

import prisma from "~/lib/prisma";

import logoCariereSmall from "~/images/logos/cariere-small-white.png";

const NavBar = () => (
  <header className="sticky top-0 z-20 flex w-full items-center bg-black px-2 py-3 text-white">
    <div>
      <Image
        src={logoCariereSmall}
        alt="Logo Cariere"
        width={98}
        height={40}
        // TODO: need to determine why Next.js's built-in compression algorithm
        // makes this image look very blurry
        unoptimized
      />
    </div>
    <nav className="ml-auto">
      <Link href="/" className="block px-5 py-3">
        Acasă
      </Link>
    </nav>
  </header>
);

type Company = {
  name: string;
  packageType: PackageType;
};

type PageProps = {
  company: Company;
  companyDescriptionHtml: string;
};

const CompanyPage: NextPage<PageProps> = ({
  company,
  companyDescriptionHtml,
}) => {
  const pageTitle = `${company.name} - Cariere v12.0`;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-black">
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <header className="flex flex-col items-center justify-center bg-black py-8 text-white sm:py-12 md:py-20">
          <h1 className="mb-2 font-display text-3xl sm:text-5xl">
            {company.name}
          </h1>
          <h2 className="font-display text-xl">
            Partener {company.packageType}
          </h2>
        </header>
        <section className="bg-white p-4">
          <div
            className="prose mx-auto max-w-prose"
            dangerouslySetInnerHTML={{ __html: companyDescriptionHtml }}
          ></div>
        </section>
        <section className="flex flex-col items-center bg-black p-3 pt-8 text-white">
          <header>
            <h2 className="font-display text-2xl">Poziții deschise</h2>
          </header>
          <div>Acest partener nu a publicat încă nicio poziție.</div>
        </section>
      </main>
    </>
  );
};

export default CompanyPage;

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export const getStaticProps: GetStaticProps<PageProps> = async ({
  params,
  locale,
}) => {
  const slug = params?.slug;
  if (typeof slug !== "string" || !slug) {
    if (process.env.NODE_ENV === "development") {
      throw new Error("`slug` route parameter is not a non-empty string");
    } else {
      return {
        notFound: true,
      };
    }
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      packageType: true,
    },
  });

  if (!company) {
    return {
      notFound: true,
    };
  }

  const converter = new showdown.Converter();
  const companyDescriptionHtml = converter.makeHtml(company.description);

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
      company,
      companyDescriptionHtml,
    },
  };
};
