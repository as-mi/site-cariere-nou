import { Table } from "@tanstack/react-table";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

type AdminTablePaginationControlsProps = {
  table: Table<any>;
  isLoadingNextPage: boolean;
};

const AdminTablePaginationControls: React.FC<
  AdminTablePaginationControlsProps
> = ({ table, isLoadingNextPage }) => (
  <div className="mt-5 mb-5 flex flex-row flex-wrap items-center justify-center gap-4 sm:mt-10">
    <span className="mx-5">
      Pagina {table.getState().pagination.pageIndex + 1} din{" "}
      {table.getPageCount()}
    </span>
    <span className="mx-5 inline-flex flex-row gap-3">
      <button
        onClick={() => table.previousPage()}
        disabled={isLoadingNextPage || !table.getCanPreviousPage()}
        className="select-none rounded border py-1 px-3 disabled:text-gray-300"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
        Pagina anterioară
      </button>
      <button
        onClick={() => table.nextPage()}
        disabled={isLoadingNextPage || !table.getCanNextPage()}
        className="select-none rounded border py-1 px-3 disabled:text-gray-300"
      >
        <FontAwesomeIcon icon={faArrowRight} className="mr-2 h-4 w-4" />
        Pagina următoare
      </button>
    </span>
    <span className="mx-5 inline-flex items-center gap-1">
      Mergi la pagina:
      <input
        type="number"
        defaultValue={table.getState().pagination.pageIndex + 1}
        onChange={(e) => {
          const page = e.target.value ? Number(e.target.value) - 1 : 0;
          table.setPageIndex(page);
        }}
        min={1}
        max={table.getPageCount()}
        className="w-16 rounded border bg-slate-800 p-1 text-white"
      />
    </span>
    <select
      value={table.getState().pagination.pageSize}
      onChange={(e) => {
        table.setPageSize(Number(e.target.value));
      }}
      className="mx-5 rounded-lg bg-slate-800 px-2 py-1 text-white hover:cursor-pointer"
    >
      {[5, 10, 25, 50].map((pageSize) => (
        <option key={pageSize} value={pageSize}>
          {pageSize} per pagină
        </option>
      ))}
    </select>
  </div>
);

export default AdminTablePaginationControls;
