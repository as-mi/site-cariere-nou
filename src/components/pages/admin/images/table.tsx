import { useCallback, useMemo, useState } from "react";

import Link from "next/link";

import { createColumnHelper, PaginationState } from "@tanstack/react-table";

import { Image as PrismaImage } from "@prisma/client";
import { getQueryKey } from "@trpc/react-query";

import { useQueryClient } from "@tanstack/react-query";

import { trpc } from "~/lib/trpc";
import type { PaginatedData } from "~/api/pagination";

import AdminTable from "../common/table";

export type Image = Pick<
  PrismaImage,
  "id" | "fileName" | "contentType" | "width" | "height"
>;

const columnHelper = createColumnHelper<Image>();

type AdminImagesTableProps = {
  initialData?: PaginatedData<Image>;
};

const AdminImagesTable: React.FC<AdminImagesTableProps> = ({ initialData }) => {
  const initialPaginationState = {
    pageIndex: 0,
    pageSize: 5,
  };

  const [pagination, setPagination] = useState<PaginationState>(
    initialPaginationState
  );

  const query = trpc.admin.image.readMany.useQuery(
    { ...pagination },
    {
      initialData:
        pagination === initialPaginationState ? initialData : undefined,
      staleTime: 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: true,
    }
  );

  const queryClient = useQueryClient();

  const imageDeleteMutation = trpc.admin.image.delete.useMutation({
    onSuccess: () => {
      // We must invalidate this page of data and all the following pages
      let pageCount = query.data!.pageCount;
      for (let { pageIndex } = pagination; pageIndex < pageCount; ++pageIndex) {
        const queryKey = getQueryKey(trpc.admin.image.readMany, {
          ...pagination,
          pageIndex,
        });
        queryClient.invalidateQueries(queryKey);
      }
    },
    onError: (error) => alert(`Eroare la ștergerea imaginii: ${error.message}`),
  });

  const handleImageDelete = useCallback(
    (userId: number) => {
      if (window.confirm("Sigur vrei să ștergi această imagine?")) {
        imageDeleteMutation.mutate({ id: userId });
      }
    },
    [imageDeleteMutation]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        meta: {
          isRowHeader: true,
        },
      }),
      columnHelper.accessor("fileName", {
        header: "Nume fișier",
      }),
      columnHelper.accessor("contentType", {
        header: "Tip fișier",
      }),
      columnHelper.display({
        header: "Dimensiuni",
        cell: (ctx) => `${ctx.row.original.width}x${ctx.row.original.height}`,
      }),
      columnHelper.display({
        header: "URL",
        cell: (ctx) => {
          const url = `/api/images/${ctx.row.original.id}`;
          return (
            <Link href={url} target="_blank">
              {url}
            </Link>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Acțiuni",
        cell: (ctx) => (
          <div className="flex flex-col">
            <Link href={`/admin/images/${ctx.row.original.id}/edit`}>
              Editează
            </Link>
            <button
              onClick={() => handleImageDelete(ctx.row.original.id)}
              className="block"
            >
              Șterge
            </button>
          </div>
        ),
      }),
    ],
    [handleImageDelete]
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

export default AdminImagesTable;
