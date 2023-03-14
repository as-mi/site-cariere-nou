import { Dispatch, SetStateAction, useEffect } from "react";

import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

import { PaginatedData } from "~/api/pagination";

import AdminTableHeader from "./header";
import AdminTableBody from "./body";
import AdminTablePaginationControls from "./pagination-controls";

type QueryResult<TData> = {
  data?: PaginatedData<TData>;
  error: { message: string } | null;
  isLoading: boolean;
  isFetching: boolean;
  isPreviousData: boolean;
};

type AdminTableProps<TData> = {
  initialPageIndex?: number;
  initialPageSize?: number;
  query: QueryResult<TData>;
  columns: ColumnDef<TData, any>[];
  pagination: PaginationState;
  onPaginationChange: Dispatch<SetStateAction<PaginationState>>;
};

const AdminTable = <TData,>({
  query,
  columns,
  pagination,
  onPaginationChange,
}: AdminTableProps<TData>): JSX.Element => {
  const data = query.data;
  const pageCount = data?.pageCount ?? -1;
  const table = useReactTable({
    data: data?.results ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    onPaginationChange,
    state: {
      pagination,
    },
  });

  useEffect(() => {
    // If all the data on the page we're currently on gets deleted,
    // move us back to the previous page (if possible)
    if (data?.results?.length === 0) {
      onPaginationChange((pagination) => ({
        ...pagination,
        pageIndex: Math.max(0, pagination.pageIndex - 1),
      }));
    }
  }, [data, onPaginationChange]);

  if (!data) {
    if (query.isLoading) {
      return <p>Se încarcă...</p>;
    }

    return <p>Eroare la încărcarea datelor: {query.error?.message}</p>;
  }

  return (
    <div>
      <div className="relative overflow-x-auto py-4">
        {query.isFetching && data.pageCount !== 0 && (
          <div className="absolute flex h-full w-full items-center justify-center bg-black bg-opacity-90">
            <span className="font-display text-3xl font-bold">
              Se încarcă următoarea pagină de rezultate...
            </span>
          </div>
        )}
        <table className="w-full text-center">
          <AdminTableHeader table={table} />
          <AdminTableBody table={table} />
        </table>
      </div>
      <AdminTablePaginationControls
        table={table}
        isLoadingNextPage={query.isLoading || query.isPreviousData}
      />
    </div>
  );
};

export default AdminTable;
