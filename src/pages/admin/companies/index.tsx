import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import AdminCompaniesPageHeader from "~/components/pages/admin/companies/header";
import AdminCompaniesTable, {
  Company,
} from "~/components/pages/admin/companies/table";

type PageProps = {
  companiesCount: number;
  companies: Company[];
};

const AdminCompaniesPage: NextPageWithLayout<PageProps> = ({
  companiesCount,
  companies,
}) => (
  <>
    <AdminCompaniesPageHeader companiesCount={companiesCount} />
    <AdminCompaniesTable
      initialData={{
        pageCount: Math.ceil(companiesCount / DEFAULT_PAGE_SIZE),
        results: companies,
      }}
    />
  </>
);

export default AdminCompaniesPage;

AdminCompaniesPage.getLayout = (page: ReactElement) => (
  <Layout title="Companii">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      props: {
        session,
        companiesCount: 0,
        companies: [],
      },
    };
  }

  const companiesCount = await prisma.company.count();
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      packageType: true,
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      companiesCount,
      companies,
    },
  };
};
