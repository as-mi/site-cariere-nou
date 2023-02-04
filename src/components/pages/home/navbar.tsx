import { useTranslation } from "next-i18next";

import Link from "next/link";

import { Role } from "@prisma/client";

import CommonNavBar, { RenderLinksParams } from "~/components/common/navbar";
import useRole from "~/hooks/use-role";
import { useCallback } from "react";

const NavBar: React.FC = () => {
  const { t } = useTranslation("home");

  const role = useRole();

  const renderLinks = useCallback(
    ({ closeNavMenu }: RenderLinksParams) => {
      const handleLinkClick = (e: React.MouseEvent) => {
        e.preventDefault();

        const anchorElement = e.target as HTMLAnchorElement;
        const link = anchorElement.href;
        const hashIndex = link.lastIndexOf("#");

        if (hashIndex === -1) {
          console.error("Could not find hash in link: %s", link);
          return;
        }

        const targetId = link.substring(hashIndex + 1);
        const element = document.getElementById(targetId);

        if (element) {
          closeNavMenu();
          element.scrollIntoView({ behavior: "smooth" });
        }
      };

      const links = [
        { targetId: "hero", label: t("navbar.home") },
        { targetId: "about", label: t("navbar.about") },
        { targetId: "partners", label: t("navbar.partners") },
        { targetId: "contact", label: t("navbar.contact") },
      ];

      return (
        <>
          {links.map(({ targetId, label }, index) => (
            <li key={index} className="md:inline-block">
              <a
                onClick={handleLinkClick}
                href={`#${targetId}`}
                className="block px-5 py-3"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="md:inline-block">
            <Link href="/profile" className="block px-5 py-3">
              {t("navbar.profile")}
            </Link>
          </li>
          {role === Role.ADMIN && (
            <li className="md:inline-block">
              <Link href="/admin" className="block px-5 py-3">
                {t("navbar.adminDashboard")}
              </Link>
            </li>
          )}
        </>
      );
    },
    [t, role]
  );

  return <CommonNavBar renderLinks={renderLinks} />;
};

export default NavBar;
