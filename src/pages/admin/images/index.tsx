import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";
import AdminImagesPageHeader from "~/components/pages/admin/images/header";
import AdminImagesTable, { Image } from "~/components/pages/admin/images/table";

type PageProps = {
  imagesCount: number;
  images: Image[];
};

const AdminImagesPage: NextPageWithLayout<PageProps> = ({
  imagesCount,
  images,
}) => (
  <>
    <AdminImagesPageHeader imagesCount={imagesCount} />
    <AdminImagesTable
      initialData={{
        pageCount: Math.ceil(imagesCount / DEFAULT_PAGE_SIZE),
        results: images,
      }}
    />
  </>
);

export default AdminImagesPage;

AdminImagesPage.getLayout = (page: ReactElement) => (
  <Layout title="Imagini">{page}</Layout>
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
        imagesCount: 0,
        images: [],
      },
    };
  }

  const imagesCount = await prisma.image.count();
  const images = await prisma.image.findMany({
    select: {
      id: true,
      fileName: true,
      contentType: true,
      width: true,
      height: true,
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: { id: "asc" },
  });

  return {
    props: {
      session,
      imagesCount,
      images,
    },
  };
};
