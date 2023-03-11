import _, { values } from "lodash";

import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import AdminResumesPageHeader from "~/components/pages/admin/resumes/header";
import AdminResumesTable, {
  Resume,
} from "~/components/pages/admin/resumes/table";

type PageProps = {
  resumesCount: number;
  resumes: Resume[];
};

const AdminResumesPage: NextPageWithLayout<PageProps> = ({
  resumesCount,
  resumes,
}) => (
  <>
    <AdminResumesPageHeader resumesCount={resumesCount} />
    <AdminResumesTable
      initialData={{
        pageCount: Math.ceil(resumesCount / DEFAULT_PAGE_SIZE),
        results: resumes,
      }}
    />
  </>
);

export default AdminResumesPage;

AdminResumesPage.getLayout = (page: ReactElement) => (
  <Layout title="CV-uri">{page}</Layout>
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
        resumesCount: 0,
        resumes: [],
      },
    };
  }

  const resumesCount = await prisma.resume.count();
  const resumes = await prisma.resume.findMany({
    select: {
      id: true,
      user: {
        select: {
          name: true,
        },
      },
      fileName: true,
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ id: "asc" }],
  });

  const ids = resumes.map((resume) => resume.id);
  const resumeSizes = await prisma.$queryRawUnsafe<
    { id: number; length: number }[]
  >(`SELECT id, LENGTH(data)
    FROM "Resume"
    WHERE id IN (${ids})
    LIMIT ${DEFAULT_PAGE_SIZE};`);
  const resumeSizesById = new Map<number, number>();
  resumeSizes.forEach(({ id, length }) => resumeSizesById.set(id, length));

  return {
    props: {
      session,
      resumesCount,
      resumes: resumes.map((resume) => ({
        ...resume,
        fileSize: resumeSizesById.get(resume.id)!,
      })),
    },
  };
};
