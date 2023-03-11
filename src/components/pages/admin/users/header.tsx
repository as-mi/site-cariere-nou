import Link from "next/link";

import { trpc } from "~/lib/trpc";

import Button from "~/components/pages/admin/common/button";
import CreateFakeObjectButton from "~/components/pages/admin/common/create-fake-object-button";

type AdminUsersPageHeaderProps = {
  usersCount: number;
};

const AdminUsersPageHeader: React.FC<AdminUsersPageHeaderProps> = ({
  usersCount,
}) => (
  <header>
    <h1 className="my-2 font-display text-3xl">Utilizatori</h1>
    <p className="my-2">
      {usersCount == 1
        ? `Există 1 utilizator înscris`
        : `Sunt ${usersCount} utilizatori înscriși`}{" "}
      în platformă.
    </p>
    <p className="my-4 flex flex-row flex-wrap justify-center gap-4 md:justify-start">
      <Button as={Link} href="/admin/users/new">
        Adaugă un utilizator nou
      </Button>
      {process.env.NODE_ENV === "development" && (
        <CreateFakeObjectButton
          label="Generează un nou utilizator cu date fake"
          createFakeObjectProcedure={trpc.admin.user.createFake}
          invalidateQueryProcedure={trpc.admin.user.readMany}
        />
      )}
    </p>
  </header>
);

export default AdminUsersPageHeader;
