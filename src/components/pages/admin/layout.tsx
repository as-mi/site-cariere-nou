import { useState } from "react";

import Head from "next/head";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faBars,
  faBuilding,
  faFile,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type LayoutProps = {
  title: string;
  renderSidebar?: boolean;
  children: React.ReactNode;
};

const links = [
  {
    href: "/admin/users",
    icon: faUser,
    label: "Utilizatori",
  },
  {
    href: "/admin/companies",
    icon: faBuilding,
    label: "Companii",
  },
  {
    href: "/admin/positions",
    icon: faAddressCard,
    label: "Posturi",
  },
  {
    href: "/admin/resumes",
    icon: faFile,
    label: "CV-uri",
  },
];

const Layout: React.FC<LayoutProps> = ({ title, renderSidebar, children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="sm:flex sm:flex-wrap">
        {renderSidebar && (
          <div className="text-white sm:inline-block">
            <div className="block bg-zinc-700 p-3 sm:hidden">
              <button
                onClick={toggleSidebar}
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
                        className="flex items-center p-3 hover:bg-zinc-800"
                      >
                        <FontAwesomeIcon
                          icon={link.icon}
                          className="h-6 w-6 pr-2"
                        />
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
        )}
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
