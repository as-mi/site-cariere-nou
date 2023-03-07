import { flexRender, Table } from "@tanstack/react-table";

type AdminTableHeaderProps = {
  table: Table<any>;
};

const AdminTableHeader: React.FC<AdminTableHeaderProps> = ({ table }) => (
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th key={header.id}>
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

export default AdminTableHeader;
