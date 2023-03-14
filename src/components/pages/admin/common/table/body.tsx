import classNames from "classnames";
import { flexRender, Table } from "@tanstack/react-table";

type AdminTableBodyProps = {
  table: Table<any>;
};

const AdminTableBody: React.FC<AdminTableBodyProps> = ({ table }) => (
  <tbody>
    {table.getRowModel().rows.map((row) => (
      <tr key={row.id}>
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta;
          const isRowHeader = meta?.isRowHeader ?? false;
          const Tag = isRowHeader ? "th" : "td";
          return (
            <Tag
              key={cell.id}
              scope={isRowHeader ? "row" : undefined}
              style={meta?.cellStyle}
              className={classNames("px-3", meta?.cellClassName)}
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
