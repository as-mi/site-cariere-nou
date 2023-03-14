import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { Role, User as PrismaUser } from "@prisma/client";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";
import prisma from "~/lib/prisma";

import { NextPageWithLayout } from "~/pages/_app";

import Layout from "~/components/pages/admin/layout";

type User = Pick<PrismaUser, "name" | "role">;

type PageProps = {
  user: User;
};

const AdminViewUserPage: NextPageWithLayout<PageProps> = ({ user }) => (
  <>
    <header>
      <Link href="/admin/users">Înapoi</Link>
      <h1 className="mt-3 mb-1 font-display text-2xl font-bold">
        Afișează detaliile unui utilizator
      </h1>
    </header>
    <div className="space-y-4">
      <section>
        <h2 className="font-display text-xl font-semibold">Nume</h2>
        <p>{user.name}</p>
      </section>
      <section>
        <h2 className="font-display text-xl font-semibold">Rol</h2>
        <p>{user.role.toLowerCase()}</p>
      </section>
    </div>
  </>
);

export default AdminViewUserPage;

AdminViewUserPage.getLayout = (page: ReactElement) => (
  <Layout title="Afișează detaliile unui utilizator">{page}</Layout>
);

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
  resolvedUrl,
  params,
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
        user: null as unknown as User,
      },
    };
  }

  const id = params?.id;
  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const userId = parseInt(id);
  if (Number.isNaN(userId)) {
    return {
      notFound: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      role: true,
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session,
      user,
    },
  };
};
