import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { getQueryKey } from "@trpc/react-query";

import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/lib/trpc";
import type { PaginatedData } from "~/api/pagination";

import AdminTable from "../common/table";

export type Position = {
  id: number;
  title: string;
  companyName: string;
};

const columnHelper = createColumnHelper<Position>();

type AdminPositionsTableProps = {
  initialData?: PaginatedData<Position>;
};

const AdminPositionsTable: React.FC<AdminPositionsTableProps> = ({
  initialData,
}) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState
  );

  const query = trpc.admin.position.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    }
  );

  const queryClient = useQueryClient();

  const positionDeleteMutation = trpc.admin.position.delete.useMutation({
    onSuccess: () => {
      // We must invalidate this page of data and all the following pages
      let pageCount = query.data!.pageCount;
      for (let { pageIndex } = pagination; pageIndex < pageCount; ++pageIndex) {
        const queryKey = getQueryKey(trpc.admin.user.readMany, {
          ...pagination,
          pageIndex,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
    onError: (error) => alert(`Eroare la ștergerea postului: ${error.message}`),
  });

  const handlePositionDelete = useCallback(
    (positionId: number) => {
      if (window.confirm("Sigur vrei să ștergi acest post?")) {
        positionDeleteMutation.mutate({ id: positionId });
      }
    },
    [positionDeleteMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor("title", {
        header: "Titlu",
      }),
      columnHelper.accessor("companyName", {
        header: "Nume companie",
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/admin/positions/${ctx.row.original.id}`}>
              Afișează detaliile
            </Link>
            <Link href={`/admin/positions/${ctx.row.original.id}/applications`}>
              Vezi aplicanții
            </Link>
            <Link href={`/admin/positions/${ctx.row.original.id}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handlePositionDelete(ctx.row.original.id)}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handlePositionDelete]
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

export default AdminPositionsTable;
