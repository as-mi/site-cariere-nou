import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";
import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import AdminPositionsPageHeader from "~/components/pages/admin/positions/header";
import AdminPositionsTable, {
  Position,
} from "~/components/pages/admin/positions/table";

type PageProps = {
  positionsCount: number;
  positions: Position[];
};

const AdminPositionsPage: NextPageWithLayout<PageProps> = ({
  positionsCount,
  positions,
}) => (
  <>
    <AdminPositionsPageHeader positionsCount={positionsCount} />
    <AdminPositionsTable
      initialData={{
        pageCount: Math.ceil(positionsCount / DEFAULT_PAGE_SIZE),
        results: positions,
      }}
    />
  </>
);

export default AdminPositionsPage;

AdminPositionsPage.getLayout = (page: ReactElement) => (
  <Layout title="Posturi">{page}</Layout>
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
        positionsCount: 0,
        positions: [],
      },
    };
  }

  const positionsCount = await prisma.position.count();
  const positions = await prisma.position.findMany({
    select: {
      id: true,
      title: true,
      company: {
        select: {
          name: true,
        },
      },
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      session,
      positionsCount,
      positions: positions.map((position) => ({
        id: position.id,
        title: position.title,
        companyName: position.company.name,
      })),
    },
  };
};
