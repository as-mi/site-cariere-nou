import { GetStaticProps, NextPage } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import prisma from "~/lib/prisma";

type Company = {
  name: string;
  description: string;
};

type PageProps = {
  company: Company;
};

const CompanyPage: NextPage<PageProps> = ({ company }) => (
  <main>
    <header>
      <h1>{company.name}</h1>
    </header>
    <section>{company.description}</section>
  </main>
);

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
    },
  });

  if (!company) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "ro", ["common", "home"])),
      company,
    },
  };
};
