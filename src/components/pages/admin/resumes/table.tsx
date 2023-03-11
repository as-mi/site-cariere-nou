import { useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { trpc } from "~/lib/trpc";
import type { PaginatedData } from "~/api/pagination";

import AdminTable from "../common/table";

export type Resume = {
  id: number;
  user: { name: string };
  fileName: string;
  fileSize: number;
};

const columnHelper = createColumnHelper<Resume>();

type AdminResumesTableProps = {
  initialData?: PaginatedData<Resume>;
};

const AdminResumesTable: React.FC<AdminResumesTableProps> = ({
  initialData,
}) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState
  );

  const query = trpc.admin.resume.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    }
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor((resume) => resume.user.name, {
        header: "Nume utilizator",
      }),
      columnHelper.accessor("fileName", {
        header: "Nume fișier",
      }),
      columnHelper.accessor("fileSize", {
        header: "Dimensiune fișier",
        cell: (ctx) => {
          const { fileSize } = ctx.row.original;

          if (fileSize < 1024) {
            return `${fileSize} bytes`;
          } else {
            return `${Math.round(fileSize / 1024)} kilobytes`;
          }
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/api/resumes/${ctx.row.original.id}`}>Vezi</Link>
          </div>
        ),
      }),
    ],
    []
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

export default AdminResumesTable;
