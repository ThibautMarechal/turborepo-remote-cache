import * as React from 'react';
import ListTitle from './ListTitle';
import { Pagination, type PaginationProps } from './Pagination';
import { Table, type TableProps } from './Table';

type Props<TableElement> = {
  tableProps: TableProps<TableElement>;
  paginationProps: PaginationProps;
  title: React.ReactNode;
  count: number;
  searchable?: boolean;
  onRowDoubleClick?: (tableElement: TableElement, e: React.MouseEvent) => void;
};

export function TablePage<TableElement>({ title, count, tableProps, paginationProps, searchable, onRowDoubleClick }: Props<TableElement>) {
  return (
    <>
      <ListTitle title={title} count={count} searchable={searchable} />
      {count ? (
        <>
          <Table {...tableProps} onRowDoubleClick={onRowDoubleClick} />
          <Pagination {...paginationProps} />
        </>
      ) : (
        <div className="mt-40 text-center text-xl opacity-50">No content</div>
      )}
    </>
  );
}

export default TablePage;
