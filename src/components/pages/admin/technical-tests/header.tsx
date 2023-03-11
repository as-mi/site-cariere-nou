import Link from "next/link";

import Button from "~/components/pages/admin/common/button";

type AdminTechnicalTestsPageHeaderProps = {
  technicalTestsCount: number;
};

const AdminTechnicalTestsPageHeader: React.FC<
  AdminTechnicalTestsPageHeaderProps
> = ({ technicalTestsCount }) => (
  <header>
    <h1 className="my-2 font-display text-3xl">Teste tehnice</h1>
    <p className="my-2">
      {technicalTestsCount == 1
        ? `Există 1 test tehnic`
        : `Sunt ${technicalTestsCount} teste tehnice`}{" "}
      în baza de date.
    </p>
    <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
      <Button as={Link} href="/admin/technical-tests/new">
        Adaugă un test tehnic nou
      </Button>
    </p>
  </header>
);

export default AdminTechnicalTestsPageHeader;
