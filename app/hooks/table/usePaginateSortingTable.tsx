import { useReactTable, type TableOptions, getCoreRowModel } from '@tanstack/react-table';
import { orderByToSortingState, sortingStateToOrderBy } from '~/utils/sort';
import { useSortSearchParams } from '~/hooks/useSortSearchParams';
import { usePaginateSearchParams } from '../usePaginateSearchParams';
import * as React from 'react';
import { useFetcher } from '~/utils/superjson';

export function usePaginateSortingTable<TableElement>(
  tableOptions: Omit<TableOptions<TableElement>, 'getCoreRowModel'>,
  count: number,
  Actions?: React.ComponentType<{ resource: TableElement }>,
) {
  const { orderBy, setOrderBy } = useSortSearchParams();

  const [pagedData, setPagedData] = React.useState(tableOptions.data);

  const [previousData, setPreviousData] = React.useState(tableOptions.data);
  if (tableOptions.data !== previousData) {
    setPreviousData(tableOptions.data);
    setPagedData(tableOptions.data);
  }

  const fetcher = useFetcher<{ items: TableElement[] }>();

  React.useEffect(() => {
    if (fetcher.data) {
      setPagedData((previousData) => [...previousData, ...(fetcher.data?.items ?? [])]);
    }
  }, [fetcher.data]);

  const sorting = orderByToSortingState(orderBy);

  const { skip, take, nextUrl, previousUrl, getUrlAtPage } = usePaginateSearchParams();

  const columns = React.useMemo(() => {
    const cols = [...tableOptions.columns];
    if (Actions) {
      cols.push({
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => <Actions resource={row.original} />,
      });
    }
    return cols;
  }, [tableOptions, Actions]);

  return {
    tableProps: useReactTable({
      ...tableOptions,
      columns,
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
      onLoadMore: (page: string) => {
        fetcher.load(page);
      },
    },
  };
}
