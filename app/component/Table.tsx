import * as React from 'react';
import type { TableInstance } from 'react-table';

export function Table<TableElement extends object>({ getTableProps, headerGroups, getTableBodyProps, prepareRow, rows }: TableInstance<TableElement>) {
  return (
    <table {...getTableProps()} className="table table-zebra w-full flex-grow-5">
      <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={index}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} key={column.id}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map((cell) => {
                return (
                  <td {...cell.getCellProps()} key={`${cell.row.id}_${cell.column.id}`}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
