import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import Layout from "~/components/pages/admin/layout";

import Button from "~/components/pages/admin/common/button";
import CreateFakeUserButton from "~/components/pages/admin/users/create-fake-user-button";

import { DEFAULT_PAGE_SIZE } from "~/components/pages/admin/common/table";
import AdminUsersTable, { User } from "~/components/pages/admin/users/table";

type PageProps = {
  usersCount: number;
  users: User[];
};

const AdminUsersPage: NextPageWithLayout<PageProps> = ({
  usersCount,
  users,
}) => (
  <>
    <header>
      <h1 className="my-2 font-display text-3xl">Utilizatori</h1>
      <p className="my-2">
        {usersCount == 1
          ? `Există 1 utilizator înscris`
          : `Sunt ${usersCount} utilizatori înscriși`}{" "}
        în platformă.
      </p>
      <p className="my-4 space-x-4">
        <Button element={Link} href="/admin/users/new">
          Adaugă un utilizator nou
        </Button>
        {process.env.NODE_ENV === "development" && <CreateFakeUserButton />}
      </p>
    </header>
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
