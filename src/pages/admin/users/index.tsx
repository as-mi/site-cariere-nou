import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import Layout from "~/components/pages/admin/layout";
import AdminUsersTable, { User } from "~/components/pages/admin/users/table";

const INITIAL_PAGE_SIZE = 5;

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
      <p className="my-4">
        <Link
          href="/admin/users/new"
          className="inline-block rounded-md bg-blue-600 py-2 px-3"
        >
          Adaugă un utilizator nou
        </Link>
      </p>
    </header>
    <AdminUsersTable
      initialPageSize={INITIAL_PAGE_SIZE}
      initialData={{
        pageCount: Math.ceil(usersCount / INITIAL_PAGE_SIZE),
        users,
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
    take: INITIAL_PAGE_SIZE,
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
