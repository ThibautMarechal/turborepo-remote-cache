import * as React from 'react';
import type { TableInstance } from '@tanstack/react-table';
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
                  {header.isPlaceholder ? null : (header.renderHeader() as React.ReactNode)}
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
                  return <td key={cell.id}>{cell.renderCell() as React.ReactNode}</td>;
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
                    {header.isPlaceholder ? null : (header.renderFooter() as React.ReactNode)}
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
