import { flexRender, Table } from "@tanstack/react-table";

type AdminTableBodyProps = {
  table: Table<any>;
};

const AdminTableBody: React.FC<AdminTableBodyProps> = ({ table }) => (
  <tbody>
    {table.getRowModel().rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => {
          const isRowHeader = cell.column.columnDef.meta?.isRowHeader ?? false;
          const Tag = isRowHeader ? "th" : "td";
          return (
            <Tag
              key={cell.id}
              scope={isRowHeader ? "row" : undefined}
              className="px-3"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Tag>
          );
        })}
      </tr>
    ))}
  </tbody>
);

export default AdminTableBody;
