import { useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { PaginatedData } from "~/api/pagination";

import { trpc } from "~/lib/trpc";

import AdminTable from "~/components/pages/admin/common/table";

export type Response = {
  user: {
    id: number;
    name: string;
  };
  startTime: string;
  endTime: string;
};

const columnHelper = createColumnHelper<Response>();

type AdminTechnicalTestResponsesTableProps = {
  technicalTestId: number;
  initialData?: PaginatedData<Response>;
};

const AdminTechnicalTestResponsesTable: React.FC<
  AdminTechnicalTestResponsesTableProps
> = ({ technicalTestId, initialData }) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );

  const query = trpc.admin.technicalTest.readResponses.useQuery(
    { id: technicalTestId, ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    },
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("user.id", {
        header: "ID utilizator",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor("user.name", {
        header: "Nume",
        meta: {
          cellClassName: "inline-block px-1",
          cellStyle: {
            minWidth: "max-content",
          },
        },
      }),
      columnHelper.accessor("startTime", {
        header: "Timp începere",
      }),
      columnHelper.accessor("endTime", {
        header: "Timp trimitere",
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => {
          return (
            <div className="flex flex-col">
              <Link href={`/admin/users/${ctx.row.original.user.id}`}>
                Vezi detaliile participantului
              </Link>
              <Link
                href={`/api/technical-tests/${technicalTestId}/answers?userId=${ctx.row.original.user.id}`}
              >
                Vezi răspunsurile
              </Link>
            </div>
          );
        },
      }),
    ],
    [technicalTestId],
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

export default AdminTechnicalTestResponsesTable;
