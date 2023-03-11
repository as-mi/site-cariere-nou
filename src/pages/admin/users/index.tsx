import { ReactElement } from "react";

import { GetServerSideProps } from "next";

import { Role } from "@prisma/client";

import { DEFAULT_PAGE_SIZE } from "~/api/pagination";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";

import AdminUsersTable, { User } from "~/components/pages/admin/users/table";
import AdminUsersPageHeader from "~/components/pages/admin/users/header";

type PageProps = {
  usersCount: number;
  users: User[];
};

const AdminUsersPage: NextPageWithLayout<PageProps> = ({
  usersCount,
  users,
}) => (
  <>
    <AdminUsersPageHeader usersCount={usersCount} />
    <AdminUsersTable
      initialData={{
        pageCount: Math.ceil(usersCount / DEFAULT_PAGE_SIZE),
        results: users,
      }}
    />
  </>
);

export default AdminUsersPage;

AdminUsersPage.getLayout = (page: ReactElement) => (
  <Layout title="Utilizatori">{page}</Layout>
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
        usersCount: 0,
        users: [],
      },
    };
  }

  const usersCount = await prisma.user.count();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
    take: DEFAULT_PAGE_SIZE,
    orderBy: [{ id: "asc" }],
  });

  return {
    props: {
      session,
      usersCount,
      users,
    },
  };
};
