import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { User as PrismaUser } from "@prisma/client";
import { getQueryKey } from "@trpc/react-query";

import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/lib/trpc";
import type { PaginatedData } from "~/api/pagination";

import AdminTable from "../common/table";

export type User = Pick<PrismaUser, "id" | "email" | "name" | "role">;

const columnHelper = createColumnHelper<User>();

type AdminUsersTableProps = {
  initialData?: PaginatedData<User>;
};

const AdminUsersTable: React.FC<AdminUsersTableProps> = ({ initialData }) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );

  const query = trpc.admin.user.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
    },
  );

  const queryClient = useQueryClient();

  const userDeleteMutation = trpc.admin.user.delete.useMutation({
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
    onError: (error) =>
      alert(`Eroare la ștergerea utilizatorului: ${error.message}`),
  });

  const handleUserResetPassword = useCallback((userId: number) => {
    console.log("Reset password for user %d", userId);
    alert("Această funcționalitate nu este încă implementată.");
  }, []);

  const handleUserDelete = useCallback(
    (userId: number) => {
      if (window.confirm("Sigur vrei să ștergi acest utilizator?")) {
        userDeleteMutation.mutate({ id: userId });
      }
    },
    [userDeleteMutation],
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
            <Link href={`/admin/users/${ctx.row.original.id}/`}>Afișează</Link>
            <Link href={`/admin/users/${ctx.row.original.id}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handleUserResetPassword(ctx.row.original.id)}
              className="block"
            >
              Resetează parola
            </button>
            <button
              onClick={() => handleUserDelete(ctx.row.original.id)}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handleUserResetPassword, handleUserDelete],
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

export default AdminUsersTable;
