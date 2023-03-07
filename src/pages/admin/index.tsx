import { ReactElement } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faHome } from "@fortawesome/free-solid-svg-icons";

import { getServerSession, redirectToLoginPage } from "~/lib/auth";

import useUser from "~/hooks/use-user";

import { NextPageWithLayout } from "~/pages/_app";
import Layout from "~/components/pages/admin/layout";
import {
  LinkData,
  links as adminPagesLinks,
} from "~/components/pages/admin/links";

const links = adminPagesLinks.filter((link) => link.href !== "/admin");

type ListItemProps = LinkData;

const ListItem: React.FC<ListItemProps> = ({ href, icon, label }) => (
  <li>
    <Link
      href={href}
      className="flex items-center p-3 hover:bg-white hover:bg-opacity-20 active:bg-opacity-30"
    >
      <FontAwesomeIcon icon={icon} className="mr-3 h-6 w-6" />
      {label}
    </Link>
  </li>
);

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
            <ListItem key={index} {...link} />
          ))}
        </ul>
        <h3 className="mt-3 font-display text-xl xs:text-2xl">Alte pagini</h3>
        <ul className="flex flex-col">
          <ListItem href="/" icon={faHome} label="Pagina principală" />
          <ListItem href="/profile" icon={faAddressCard} label="Contul meu" />
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
