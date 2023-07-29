import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { Company as PrismaCompany } from "@prisma/client";
import { getQueryKey } from "@trpc/react-query";

import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/lib/trpc";
import type { PaginatedData } from "~/api/pagination";

import AdminTable from "../common/table";

export type Company = Pick<PrismaCompany, "id" | "name" | "packageType">;

const columnHelper = createColumnHelper<Company>();

type AdminCompaniesTableProps = {
  initialData?: PaginatedData<Company>;
};

const AdminCompaniesTable: React.FC<AdminCompaniesTableProps> = ({
  initialData,
}) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );

  const query = trpc.admin.company.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    },
  );

  const queryClient = useQueryClient();

  const companyDeleteMutation = trpc.admin.company.delete.useMutation({
    onSuccess: () => {
      // We must invalidate this page of data and all the following pages
      let pageCount = query.data!.pageCount;
      for (let { pageIndex } = pagination; pageIndex < pageCount; ++pageIndex) {
        const queryKey = getQueryKey(trpc.admin.company.readMany, {
          ...pagination,
          pageIndex,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
    onError: (error) =>
      alert(`Eroare la ștergerea companiei: ${error.message}`),
  });

  const handleCompanyDelete = useCallback(
    (companyId: number) => {
      if (window.confirm("Sigur vrei să ștergi această companie?")) {
        companyDeleteMutation.mutate({ id: companyId });
      }
    },
    [companyDeleteMutation],
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
      columnHelper.accessor("name", {
        header: "Nume",
      }),
      columnHelper.accessor("packageType", {
        header: "Pachet",
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/admin/companies/${ctx.row.original.id}`}>
              Vizualizează
            </Link>
            <Link href={`/admin/companies/${ctx.row.original.id}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handleCompanyDelete(ctx.row.original.id)}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handleCompanyDelete],
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

export default AdminCompaniesTable;
