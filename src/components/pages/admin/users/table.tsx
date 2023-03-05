import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  RowData,
  useReactTable,
} from "@tanstack/react-table";

import { User as PrismaUser } from "@prisma/client";

import type { inferRouterOutputs } from "@trpc/server";

import { trpc } from "~/lib/trpc";
import type { AdminRouter } from "~/api/trpc/routers/admin";

export type User = Pick<PrismaUser, "id" | "email" | "name" | "role">;

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends RowData, TValue> {
    isRowHeader?: boolean;
  }
}

const columnHelper = createColumnHelper<User>();

type AdminRouterOutput = inferRouterOutputs<AdminRouter>;
type UserReadMany = AdminRouterOutput["user"]["readMany"];

type AdminUsersTableProps = {
  initialPageSize?: number;
  initialData?: UserReadMany;
};

const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  initialPageSize,
  initialData,
}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize ?? 5,
  });

  const [queryInitialData, setQueryInitialData] = useState(initialData);
  useEffect(() => {
    setQueryInitialData(undefined);
  }, [pagination]);

  const query = trpc.admin.user.readMany.useQuery(
    { ...pagination },
    { initialData: queryInitialData, staleTime: 1000 }
  );

  const router = useRouter();

  const userDeleteMutation = trpc.admin.user.delete.useMutation({
    onSuccess: () => {
      // TODO: invalidate query cache instead
      router.reload();
    },
    onError: (error) =>
      alert(`Eroare la ștergerea utilizatorului: ${error.message}`),
  });

  const handleUserResetPassword = useCallback((userId: number) => {
    console.log("Reset password for user %d", userId);
  }, []);

  const handleUserDelete = useCallback(
    (userId: number) => {
      if (window.confirm("Sigur vrei să ștergi acest utilizator?")) {
        userDeleteMutation.mutate({ id: userId });
      }
    },
    [userDeleteMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor("email", {
        header: "E-mail",
      }),
      columnHelper.accessor("name", {
        header: "Nume",
      }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (ctx) => ctx.getValue().toLowerCase(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/admin/users/${ctx.row.getValue("id")}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handleUserResetPassword(ctx.row.getValue("id"))}
              className="block"
            >
              Resetează parola
            </button>
            <button
              onClick={() => handleUserDelete(ctx.row.getValue("id"))}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handleUserResetPassword, handleUserDelete]
  );

  const [data, setData] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(-1);

  useEffect(() => {
    if (query.data) {
      setData(query.data.users);
      setPageCount(query.data.pageCount);
    }
  }, [query.data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  if (!data) {
    if (query.isLoading) {
      return <p>Se încarcă...</p>;
    }

    if (!query.data) {
      return <p>Eroare la încărcarea datelor</p>;
    }
  }

  return (
    <div className="relative overflow-x-auto">
      <div className="relative">
        {query.isLoading && (
          <div className="absolute flex h-full w-full items-center justify-center bg-slate-900 bg-opacity-80">
            <span className="font-display text-3xl font-bold">
              Se încarcă...
            </span>
          </div>
        )}
        <table className="w-full text-center">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const isRowHeader =
                    cell.column.columnDef.meta?.isRowHeader ?? false;
                  const Tag = isRowHeader ? "th" : "td";
                  return (
                    <Tag
                      key={cell.id}
                      scope={isRowHeader ? "row" : undefined}
                      className="px-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <span>
          Pagina {table.getState().pagination.pageIndex + 1} din{" "}
          {table.getPageCount()}
        </span>
        <span className="mx-3">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border p-1"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border p-1"
          >
            {">"}
          </button>
        </span>
        <span className="mx-3 inline-flex items-center gap-1">
          Mergi la pagina:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 rounded border bg-slate-800 p-1 text-white"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="mx-3 rounded-lg bg-slate-800 px-2 py-1 text-white hover:cursor-pointer"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize} per pagină
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AdminUsersTable;
