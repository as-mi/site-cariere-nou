import Link from "next/link";

import { trpc } from "~/lib/trpc";

import Button from "~/components/pages/admin/common/button";
import CreateFakeObjectButton from "~/components/pages/admin/common/create-fake-object-button";

type AdminEventsPageHeaderProps = {
  eventsCount: number;
};

const AdminEventsPageHeader: React.FC<AdminEventsPageHeaderProps> = ({
  eventsCount,
}) => (
  <header>
    <h1 className="my-2 font-display text-3xl">Evenimente</h1>
    <p className="my-2">
      {eventsCount == 1
        ? `Există 1 eveniment`
        : `Sunt ${eventsCount} evenimente`}{" "}
      în platformă.
    </p>
    <p className="my-4 space-x-4">
      <Button element={Link} href="/admin/events/new">
        Adaugă un eveniment nou
      </Button>
      {process.env.NODE_ENV === "development" && (
        <CreateFakeObjectButton
          label="Generează un nou eveniment cu date fake"
          createFakeObjectProcedure={trpc.admin.event.createFake}
          invalidateQueryProcedure={trpc.admin.event.readMany}
        />
      )}
    </p>
  </header>
);

export default AdminEventsPageHeader;
