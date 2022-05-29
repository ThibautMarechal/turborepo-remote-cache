import type { ColumnDef, ReactTableGenerics, Table } from '@tanstack/react-table';
import { getCoreRowModel, useTableInstance } from '@tanstack/react-table';
import { orderByToSortingState, sortingStateToOrderBy } from '~/utils/sort';
import { useSortSearchParams } from '~/hooks/useSortSearchParams';
import { usePaginateSearchParams } from '../usePaginateSearchParams';
import { useFetcher } from 'remix';
import * as React from 'react';

export function usePaginateSortingTable<TableElement extends ReactTableGenerics>(
  table: Table<TableElement>,
  columns: ColumnDef<TableElement>[],
  data: TableElement['Row'][],
  count: number,
) {
  const { orderBy, setOrderBy } = useSortSearchParams();

  const [pagedData, setPagedData] = React.useState(data);
  React.useEffect(() => {
    setPagedData(data);
  }, [data]);

  const fetcher = useFetcher();

  React.useEffect(() => {
    if (fetcher.data) {
      setPagedData((previousData) => [...previousData, ...fetcher.data.items]);
    }
  }, [fetcher.data]);

  const sorting = orderByToSortingState(orderBy);

  const { skip, take, nextUrl, previousUrl, getUrlAtPage } = usePaginateSearchParams();

  return {
    tableProps: {
      ...useTableInstance(table, {
        data: pagedData,
        columns,
        state: {
          sorting,
        },
        onSortingChange: (s) => {
          const newSorting = typeof s === 'function' ? s(sorting) : s;
          setOrderBy(sortingStateToOrderBy(newSorting));
        },
        getCoreRowModel: getCoreRowModel(),
      }),
    },
    paginationProps: {
      skip,
      take,
      nextUrl,
      previousUrl,
      getUrlAtPage,
      count,
      currentPageCount: pagedData.length,
      onLoadMore: (page: string) => fetcher.load(page),
    },
  };
}
