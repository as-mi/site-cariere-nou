import { MouseEvent, useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { useTranslation } from "next-i18next";

import { useIsAdmin } from "~/hooks/use-role";

import CommonNavBar from "~/components/common/navbar";

type NavBarProps = {
  companyId: number;
};

const NavBar: React.FC<NavBarProps> = ({ companyId }) => {
  const { t } = useTranslation("common");

  const isAdmin = useIsAdmin();

  const router = useRouter();

  // We need a custom click handler for the home page link,
  // since we want to trigger a back navigation event when
  // the user comes from the home page, to allow scroll restoration to work.
  const handleClickHome = useCallback(
    (event: MouseEvent) => {
      // Prevent the implicit navigation behavior
      event.preventDefault();

      // Determine what path the link was initially pointing to
      // (this is to avoid hardcoding it)
      const anchorElement = event.target as HTMLAnchorElement;
      const href = anchorElement.href;

      const siteOrigin = window.location.origin;

      const path = href.replace(siteOrigin, "");

      // This is the best we can do in order to determine which path we came from
      if (document.referrer === `${siteOrigin}${path}`) {
        router.back();
      } else {
        router.push(path);
      }
    },
    [router]
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
          {isAdmin && (
            <li className="md:inline-block">
              <Link
                href={`/admin/companies/${companyId}/edit`}
                className="block px-5 py-3"
              >
                Editează detaliile companiei
              </Link>
            </li>
          )}
        </>
      )}
    />
  );
};

export default NavBar;
