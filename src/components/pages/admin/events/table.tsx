import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import type { Event as PrismaEvent } from "@prisma/client";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";

import { getQueryKey } from "@trpc/react-query";

import { PaginatedData } from "~/api/pagination";

import { trpc } from "~/lib/trpc";

import AdminTable from "../common/table";

export type Event = Pick<PrismaEvent, "id" | "name"> & { date: string };

const columnHelper = createColumnHelper<Event>();

type AdminEventsTableProps = {
  initialData?: PaginatedData<Event>;
};

const AdminEventsTable: React.FC<AdminEventsTableProps> = ({ initialData }) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState
  );

  const query = trpc.admin.event.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    }
  );

  const queryClient = useQueryClient();

  const eventDeleteMutation = trpc.admin.event.delete.useMutation({
    onSuccess: () => {
      // We must invalidate this page of data and all the following pages
      let pageCount = query.data!.pageCount;
      for (let { pageIndex } = pagination; pageIndex < pageCount; ++pageIndex) {
        const queryKey = getQueryKey(trpc.admin.event.readMany, {
          ...pagination,
          pageIndex,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
    onError: (error) =>
      alert(`Eroare la ștergerea evenimentului: ${error.message}`),
  });

  const handleEventDelete = useCallback(
    (eventId: number) => {
      if (window.confirm("Sigur vrei să ștergi acest eveniment?")) {
        eventDeleteMutation.mutate({ id: eventId });
      }
    },
    [eventDeleteMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor("name", {
        header: "Nume",
      }),
      columnHelper.accessor("date", {
        header: "Data",
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/admin/events/${ctx.row.getValue("id")}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handleEventDelete(ctx.row.getValue("id"))}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handleEventDelete]
  );

  return (
    <AdminTable
      query={query}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};

export default AdminEventsTable;
