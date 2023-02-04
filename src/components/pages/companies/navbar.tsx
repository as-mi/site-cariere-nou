import Link from "next/link";

import { useTranslation } from "next-i18next";

import CommonNavBar from "~/components/common/navbar";

const NavBar: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <CommonNavBar
      renderLinks={() => (
        <Link href="/" className="block px-5 py-3">
          {t("navbar.home")}
        </Link>
      )}
    />
  );
};

export default NavBar;
