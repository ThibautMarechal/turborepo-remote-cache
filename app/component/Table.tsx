import { flexRender, type RowData, type ReactTable } from '@tanstack/react-table';
import type { AppTableFeatures } from '~/hooks/table/tableFeatures';
import cn from 'classnames';

type TableInstance<TableElement extends RowData> = ReactTable<AppTableFeatures, TableElement>;

export type TableProps<TableElement extends RowData> = TableInstance<TableElement> & {
  footer?: boolean;
  onRowDoubleClick?: (element: TableElement, e: React.MouseEvent) => void;
};

export function Table<TableElement extends RowData>({ getHeaderGroups, getRowModel, getFooterGroups, footer, onRowDoubleClick }: TableProps<TableElement>) {
  return (
    <div className="relative">
      <table className="table table-compact table-zebra w-full flex-grow-5">
        <thead className="sticky top-0">
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  colSpan={header.colSpan}
                  key={header.id}
                  className={cn({ 'cursor-pointer select-none': header.column.getCanSort() })}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
                  {header.column.getSortIndex() + 1 || null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {getRowModel().rows.map((row) => {
            return (
              <tr key={row.id} onDoubleClick={(e) => onRowDoubleClick?.(row.original, e)}>
                {row.getAllCells().map((cell) => {
                  return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
        {footer && (
          <tfoot>
            {getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default Table;
