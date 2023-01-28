import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import { authOptions } from "~/lib/next-auth-options";
import { redirectToLoginPage } from "~/lib/authorization";

const AdminHomePage: NextPageWithLayout = () => {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return null;
  }

  if (session.user.role !== Role.ADMIN) {
    return <p>Nu ai dreptul să accesezi această pagină.</p>;
  }

  return (
    <>
      <header>
        <h2>Salut, {session.user.name}</h2>
      </header>
      <nav>
        <ul>
          <li>
            <Link href="/admin/users">Utilizatori</Link>
          </li>
          <li>
            <Link href="/admin/companies">Companii</Link>
          </li>
          <li>
            <Link href="/admin/internships">Stagii</Link>
          </li>
          <li>
            <Link href="/admin/resumes">CV-uri</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default AdminHomePage;

AdminHomePage.getLayout = (page: ReactElement) => (
  <Layout title="Dashboard" showSidebar={false}>
    {page}
  </Layout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  const returnUrl = context.resolvedUrl;

  if (!session || !session.user) {
    return redirectToLoginPage(returnUrl);
  }

  return {
    props: {
      session,
    },
  };
};
