import Link from "next/link";

import { useTranslation } from "next-i18next";

import { useIsAdmin } from "~/hooks/use-role";

import CommonNavBar from "~/components/common/navbar";

type NavBarProps = {
  companyId: number;
};

const NavBar: React.FC<NavBarProps> = ({ companyId }) => {
  const { t } = useTranslation("common");

  const isAdmin = useIsAdmin();

  return (
    <CommonNavBar
      renderLinks={() => (
        <>
          <li className="md:inline-block">
            <Link href="/" className="block px-5 py-3">
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
