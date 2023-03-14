import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";

import AdminPositionApplicationsPageHeader from "~/components/pages/admin/positions/applications/header";

import AdminPositionApplicationsTable, {
  Application,
} from "~/components/pages/admin/positions/applications/table";

type PageProps = {
  positionId: number;
  applicationsCount: number;
  applications: Application[];
};

const AdminPositionApplicationsPage: NextPageWithLayout<PageProps> = ({
  positionId,
  applicationsCount,
  applications,
}) => (
  <>
    <AdminPositionApplicationsPageHeader
      applicationsCount={applicationsCount}
    />
    <AdminPositionApplicationsTable
      positionId={positionId}
      initialData={{
        pageCount: Math.ceil(applicationsCount / DEFAULT_PAGE_SIZE),
        results: applications,
      }}
    />
  </>
);

export default AdminPositionApplicationsPage;

AdminPositionApplicationsPage.getLayout = (page: ReactElement) => (
  <Layout title="Aplicanți">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
  params,
}) => {
  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const positionId = parseInt(id);
  if (Number.isNaN(positionId)) {
    return {
      notFound: true,
    };
  }

  const session = await getServerSession(req, res);

  const returnUrl = resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  if (session.user.role !== Role.ADMIN) {
    return {
      props: {
        session,
        positionId,
        applicationsCount: 0,
        applications: [],
      },
    };
  }

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: {
      title: true,
      company: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!position) {
    return {
      notFound: true,
    };
  }

  const applicationsCount = await prisma.participantApplyToPosition.count({
    where: { positionId },
  });
  const applications = await prisma.participantApplyToPosition.findMany({
    where: { positionId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      resumeId: true,
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ userId: "asc" }],
  });

  return {
    props: {
      session,
      positionId,
      applicationsCount,
      applications,
    },
  };
};
