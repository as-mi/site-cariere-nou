import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import AdminTechnicalTestsPageHeader from "~/components/pages/admin/technical-tests/header";
import AdminTechnicalTestsTable, {
  TechnicalTest,
} from "~/components/pages/admin/technical-tests/table";

type PageProps = {
  technicalTestsCount: number;
  technicalTests: TechnicalTest[];
};

const AdminTechnicalTestsPage: NextPageWithLayout<PageProps> = ({
  technicalTestsCount,
  technicalTests,
}) => (
  <>
    <AdminTechnicalTestsPageHeader technicalTestsCount={technicalTestsCount} />
    <AdminTechnicalTestsTable
      initialData={{
        pageCount: Math.ceil(technicalTestsCount / DEFAULT_PAGE_SIZE),
        results: technicalTests,
      }}
    />
  </>
);

export default AdminTechnicalTestsPage;

AdminTechnicalTestsPage.getLayout = (page: ReactElement) => (
  <Layout title="Teste tehnice">{page}</Layout>
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
        technicalTestsCount: 0,
        technicalTests: [],
      },
    };
  }

  const technicalTestsCount = await prisma.technicalTest.count();
  const technicalTests = await prisma.technicalTest.findMany({
    select: {
      id: true,
      title: true,
      position: {
        select: {
          title: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      activePosition: {
        select: {
          id: true,
        },
      },
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      session,
      technicalTestsCount,
      technicalTests,
    },
  };
};
