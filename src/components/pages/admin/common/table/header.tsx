import { flexRender, Table } from "@tanstack/react-table";

type AdminTableHeaderProps = {
  table: Table<any>;
};

const AdminTableHeader: React.FC<AdminTableHeaderProps> = ({ table }) => (
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          const columnDef = header.column.columnDef;
          const meta = columnDef.meta;
          return (
            <th
              key={header.id}
              className={meta?.headerClassName}
              style={meta?.headerStyle}
            >
              {header.isPlaceholder
                ? null
                : flexRender(columnDef.header, header.getContext())}
            </th>
          );
        })}
      </tr>
    ))}
  </thead>
);

export default AdminTableHeader;
