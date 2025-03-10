import { TFunction } from "next-i18next";

import Link from "next/link";

import { Role } from "@prisma/client";

import CommonNavBar, { RenderLinksParams } from "~/components/common/navbar";
import useRole from "~/hooks/use-role";
import { useCallback } from "react";

type NavBarProps = {
  t: TFunction;
  hideEventsLink: boolean;
  hideProfileLink: boolean;
  home: boolean;
};

type LinkData = {
  targetId: string;
  label: string;
};

const NavBar: React.FC<NavBarProps> = ({
  t,
  hideEventsLink,
  hideProfileLink,
  home,
}) => {
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

      const links: (LinkData | undefined)[] = [
        { targetId: "hero", label: t("navbar.home") },
        { targetId: "about", label: t("navbar.about") },
        { targetId: "partners", label: t("navbar.partners") },
        !hideEventsLink
          ? undefined
          : { targetId: "events", label: t("navbar.events") },
        { targetId: "contact", label: t("navbar.contact") },
      ];

      const isLoggedIn = !!role;
      const showProfileLink = isLoggedIn || !hideProfileLink;

      return (
        <>
          {links
            .filter((link) => link !== undefined)
            .map((linkData, index) => {
              const { targetId, label } = linkData!;
              return (
                <li key={index} className="sc:inline-block">
                  <a
                    onClick={handleLinkClick}
                    href={`#${targetId}`}
                    className="block px-5 py-3"
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          {showProfileLink && (
            <li className="sc:inline-block">
              <Link href="/profile" className="block px-5 py-3">
                {t("navbar.profile")}
              </Link>
            </li>
          )}
          {role === Role.ADMIN && (
            <li className="sc:inline-block">
              <Link href="/admin" className="block px-5 py-3">
                {t("navbar.adminDashboard")}
              </Link>
            </li>
          )}
        </>
      );
    },
    [t, hideEventsLink, hideProfileLink, role],
  );

  return <CommonNavBar renderLinks={renderLinks} home={home} />;
};

export default NavBar;
