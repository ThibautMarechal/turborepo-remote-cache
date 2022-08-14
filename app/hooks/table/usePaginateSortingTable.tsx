import type { TableOptions } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { orderByToSortingState, sortingStateToOrderBy } from '~/utils/sort';
import { useSortSearchParams } from '~/hooks/useSortSearchParams';
import { usePaginateSearchParams } from '../usePaginateSearchParams';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';

export function usePaginateSortingTable<TableElement>(tableOptions: Omit<TableOptions<TableElement>, 'getCoreRowModel'>, count: number) {
  const { orderBy, setOrderBy } = useSortSearchParams();

  const [pagedData, setPagedData] = React.useState(tableOptions.data);

  React.useEffect(() => {
    setPagedData(tableOptions.data);
  }, [tableOptions.data]);

  const fetcher = useFetcher();

  React.useEffect(() => {
    if (fetcher.data) {
      setPagedData((previousData) => [...previousData, ...fetcher.data.items]);
    }
  }, [fetcher.data]);

  const sorting = orderByToSortingState(orderBy);

  const { skip, take, nextUrl, previousUrl, getUrlAtPage } = usePaginateSearchParams();

  return {
    tableProps: useReactTable({
      ...tableOptions,
      data: pagedData,
      state: {
        sorting,
      },
      onSortingChange: (s) => {
        const newSorting = typeof s === 'function' ? s(sorting) : s;
        setOrderBy(sortingStateToOrderBy(newSorting));
      },
      getCoreRowModel: getCoreRowModel(),
    }),

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
