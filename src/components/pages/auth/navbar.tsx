import { MouseEvent, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { useIsAdmin } from "~/hooks/use-role";
import usePreviousPageStore from "~/hooks/use-previous-page-store";

import CommonNavBar from "~/components/common/navbar";

interface NavBarProps {
  home: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ home }) => {
  const { t } = useTranslation("common");

  const isAdmin = useIsAdmin();

  const router = useRouter();

  const { previousPage } = usePreviousPageStore();

  // In order to make scroll restoration work for this home page button,
  // we need a custom click handler which will trigger a back navigation event
  // (when appropriate)
  const handleClickHome = useCallback(
    (event: MouseEvent) => {
      // Prevent the implicit navigation behavior
      event.preventDefault();

      // Check if we came here from the home page
      if (previousPage === "/") {
        router.back();
      } else {
        router.push("/");
      }
    },
    [previousPage, router],
  );

  return (
    <CommonNavBar
      renderLinks={() => (
        <>
          <li className="md:inline-block">
            <Link
              href="/"
              onClick={handleClickHome}
              className="block px-5 py-3"
            >
              {t("navbar.home")}
            </Link>
          </li>
        </>
      )}
      home={home}
    />
  );
};

export default NavBar;
