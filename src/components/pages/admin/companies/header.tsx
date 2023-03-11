import Link from "next/link";

import Button from "~/components/pages/admin/common/button";
import RevalidateHomePageButton from "./revalidate-home-page-button";

type AdminCompaniesPageHeaderProps = {
  companiesCount: number;
};

const AdminCompaniesPageHeader: React.FC<AdminCompaniesPageHeaderProps> = ({
  companiesCount,
}) => (
  <header>
    <h1 className="my-2 font-display text-3xl">Companii</h1>
    <p className="my-2">
      {companiesCount == 1
        ? `Există 1 companie`
        : `Sunt ${companiesCount} companii`}{" "}
      în baza de date.
    </p>
    <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
      <Button as={Link} href="/admin/companies/new">
        Adaugă o companie nouă
      </Button>
      <RevalidateHomePageButton />
    </p>
  </header>
);

export default AdminCompaniesPageHeader;
