import Link from "next/link";

import Button from "~/components/pages/admin/common/button";

type AdminPositionsPageHeaderProps = {
  positionsCount: number;
};

const AdminPositionsPageHeader: React.FC<AdminPositionsPageHeaderProps> = ({
  positionsCount,
}) => (
  <header>
    <h1 className="my-2 font-display text-3xl">Posturi</h1>

    <p className="my-2">
      {positionsCount == 1 ? `Există 1 post` : `Sunt ${positionsCount} posturi`}{" "}
      în baza de date.
    </p>

    <p className="my-4 flex flex-row flex-wrap items-center justify-center gap-4 sm:justify-start">
      <Button as={Link} href="/admin/positions/new">
        Adaugă un post nou
      </Button>
    </p>
  </header>
);

export default AdminPositionsPageHeader;
