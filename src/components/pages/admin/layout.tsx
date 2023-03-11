import { useState } from "react";

import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import { Role } from "@prisma/client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import { links } from "./links";

type LayoutProps = {
  title: string;
  renderSidebar?: boolean;
  children: React.ReactNode;
};

const Sidebar: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="text-white sm:inline-block">
      <div className="block bg-zinc-700 p-3 sm:hidden">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="text-white hover:text-zinc-300"
        >
          <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
        </button>
      </div>
      <div
        className={`top-13 absolute left-0 z-50 block h-screen w-full bg-black bg-opacity-80 ${
          showSidebar ? "" : "hidden"
        } sm:static sm:inline-block sm:h-full sm:w-auto`}
      >
        <aside className="block h-full min-h-screen bg-zinc-700 xs:inline-block sm:pt-12">
          <ul>
            {links.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  onClick={() => setShowSidebar(false)}
                  className="flex items-center p-3 hover:bg-zinc-800"
                >
                  <FontAwesomeIcon icon={link.icon} className="h-6 w-6 pr-2" />
                  <span className="mr-6 flex-1 text-center xs:mr-0 xs:px-3 xs:text-start sm:px-6 md:px-8">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ title, renderSidebar, children }) => {
  const { data: session } = useSession();

  if (!session || !session.user || session.user.role !== Role.ADMIN) {
    return (
      <>
        <Head>
          <title>Acces interzis</title>
        </Head>
        <main className="flex min-h-screen w-full flex-row items-center justify-center bg-black text-white">
          <p className="m-4 text-center text-lg xs:text-xl sm:text-2xl md:text-3xl">
            Nu ai dreptul să accesezi această pagină.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="sm:flex">
        {renderSidebar && <Sidebar />}
        <main className="min-h-screen flex-1 bg-black p-3 text-white">
          {children}
        </main>
      </div>
    </>
  );
};

Layout.defaultProps = {
  renderSidebar: true,
};

export default Layout;
