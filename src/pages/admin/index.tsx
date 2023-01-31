import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

import { Role } from "@prisma/client";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import { authOptions } from "~/lib/next-auth-options";
import { redirectToLoginPage } from "~/lib/auth";

const links = [
  { href: "/admin/users", label: "Utilizatori" },
  { href: "/admin/companies", label: "Companii" },
  { href: "/admin/positions", label: "Posturi" },
  { href: "/admin/resumes", label: "CV-uri" },
];

const AdminHomePage: NextPageWithLayout = () => {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return null;
  }

  if (session.user.role !== Role.ADMIN) {
    return <p>Nu ai dreptul să accesezi această pagină.</p>;
  }

  return (
    <div className="mx-auto mt-6 max-w-xs xs:mt-12 sm:mt-20">
      <header>
        <h2 className="font-display text-2xl xs:text-3xl">
          Salut, {session.user.name}
        </h2>
        <p className="py-2">
          Bine ai venit în interfața de administrare a platformei Cariere.
        </p>
      </header>
      <nav>
        <h3 className="mt-3 font-display text-xl xs:text-2xl">
          Panouri de control
        </h3>
        <ul className="flex flex-col">
          {links.map((link, index) => (
            <li key={index}>
              <Link href={link.href} className="block p-3">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminHomePage;

AdminHomePage.getLayout = (page: ReactElement) => (
  <Layout title="Dashboard" renderSidebar={false}>
    {page}
  </Layout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

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
