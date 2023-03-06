import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";

import useUser from "~/hooks/use-user";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";

type LinkData = {
  href: string;
  label: string;
};

const links: LinkData[] = [
  { href: "/admin/events", label: "Evenimente" },
  { href: "/admin/users", label: "Utilizatori" },
  { href: "/admin/images", label: "Imagini" },
  { href: "/admin/companies", label: "Companii" },
  { href: "/admin/positions", label: "Posturi" },
  { href: "/admin/technical-tests", label: "Teste tehnice" },
  { href: "/admin/resumes", label: "CV-uri" },
  { href: "/admin/settings", label: "Setări" },
];

const AdminHomePage: NextPageWithLayout = () => {
  const user = useUser();

  return (
    <div className="mx-auto mt-6 max-w-xs xs:mt-12 sm:mt-20">
      <header>
        <h2 className="font-display text-2xl xs:text-3xl">
          Salut, {user!.name}
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
              <Link
                href={link.href}
                className="block p-3 hover:bg-white hover:bg-opacity-20 active:bg-opacity-30"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mt-3 font-display text-xl xs:text-2xl">Alte pagini</h3>
        <ul className="flex flex-col">
          <li>
            <Link
              href="/"
              className="block p-3 hover:bg-white hover:bg-opacity-20 active:bg-opacity-30"
            >
              Pagina principală
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="block p-3 hover:bg-white hover:bg-opacity-20"
            >
              Contul meu
            </Link>
          </li>
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
  const session = await getServerSession(context.req, context.res);

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
