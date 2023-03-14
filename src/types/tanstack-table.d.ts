import React from "react";
import "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends RowData, TValue> {
    isRowHeader?: boolean;
    headerClassName?: string;
    headerStyle?: React.CSSProperties;
    cellClassName?: string;
    cellStyle?: React.CSSProperties;
  }
}
