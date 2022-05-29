import * as React from 'react';
import ListTitle from './ListTitle';
import type { PaginationProps } from './Pagination';
import Pagination from './Pagination';
import type { TableProps } from './Table';
import Table from './Table';

type Props<TableElement> = {
  tableProps: TableProps<TableElement>;
  paginationProps: PaginationProps;
  title: React.ReactNode;
  count: number;
};

export function TablePage<TableElement>({ title, count, tableProps, paginationProps }: Props<TableElement>) {
  return (
    <>
      <ListTitle title={title} count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} />
    </>
  );
}

export default TablePage;
