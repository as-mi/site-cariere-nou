import { useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { PaginatedData } from "~/api/pagination";
import { trpc } from "~/lib/trpc";

import AdminTable from "~/components/pages/admin/common/table";

export type Application = {
  user: {
    id: number;
    name: string;
  };
  resumeId: number;
};

const columnHelper = createColumnHelper<Application>();

type AdminPositionApplicationsTableProps = {
  positionId: number;
  initialData?: PaginatedData<Application>;
};

const AdminPositionApplicationsTable: React.FC<
  AdminPositionApplicationsTableProps
> = ({ positionId, initialData }) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );

  const query = trpc.admin.position.readApplications.useQuery(
    { id: positionId, ...pagination },
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
      columnHelper.accessor("resumeId", {
        header: "ID CV aplicant",
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
              <Link href={`/api/resumes/${ctx.row.original.resumeId}`}>
                Vezi CV-ul
              </Link>
            </div>
          );
        },
      }),
    ],
    [],
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

export default AdminPositionApplicationsTable;
