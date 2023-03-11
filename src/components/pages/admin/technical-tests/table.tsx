import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { getQueryKey } from "@trpc/react-query";

import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/lib/trpc";
import type { PaginatedData } from "~/api/pagination";

import AdminTable from "../common/table";

export type TechnicalTest = {
  id: number;
  title: string;
  position: {
    title: string;
    company: {
      name: string;
    };
  };
  activePosition: {
    id: number;
  } | null;
};

const columnHelper = createColumnHelper<TechnicalTest>();

type AdminTechnicalTestsTableProps = {
  initialData?: PaginatedData<TechnicalTest>;
};

const AdminTechnicalTestsTable: React.FC<AdminTechnicalTestsTableProps> = ({
  initialData,
}) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState
  );

  const query = trpc.admin.technicalTest.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    }
  );

  const queryClient = useQueryClient();

  const technicalTestDeleteMutation =
    trpc.admin.technicalTest.delete.useMutation({
      onSuccess: () => {
        // We must invalidate this page of data and all the following pages
        let pageCount = query.data!.pageCount;
        for (
          let { pageIndex } = pagination;
          pageIndex < pageCount;
          ++pageIndex
        ) {
          const queryKey = getQueryKey(trpc.admin.technicalTest.readMany, {
            ...pagination,
            pageIndex,
          });
          queryClient.invalidateQueries(queryKey);
        }
      },
      onError: (error) =>
        alert(`Eroare la ștergerea testului tehnic: ${error.message}`),
    });

  const handleTechnicalTestDelete = useCallback(
    (technicalTestId: number) => {
      if (window.confirm("Sigur vrei să ștergi acest test tehnic?")) {
        technicalTestDeleteMutation.mutate({ id: technicalTestId });
      }
    },
    [technicalTestDeleteMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor(
        (technicalTest) => technicalTest.position.company.name,
        {
          header: "Nume companie",
        }
      ),
      columnHelper.accessor((technicalTest) => technicalTest.position.title, {
        header: "Titlu post",
      }),
      columnHelper.accessor("title", {
        header: "Titlu test",
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/admin/technical-tests/${ctx.row.original.id}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handleTechnicalTestDelete(ctx.row.original.id)}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handleTechnicalTestDelete]
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

export default AdminTechnicalTestsTable;
