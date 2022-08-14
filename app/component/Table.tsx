import type { Table as TableInstance } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import cn from 'classnames';

export type TableProps<TableElement> = TableInstance<TableElement> & {
  footer?: boolean;
};

export function Table<TableElement>({ getHeaderGroups, getRowModel, getFooterGroups, footer }: TableProps<TableElement>) {
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
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
