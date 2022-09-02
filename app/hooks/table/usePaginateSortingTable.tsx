import type { TableOptions } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { orderByToSortingState, sortingStateToOrderBy } from '~/utils/sort';
import { useSortSearchParams } from '~/hooks/useSortSearchParams';
import { usePaginateSearchParams } from '../usePaginateSearchParams';

export function usePaginateSortingTable<TableElement>(tableOptions: Omit<TableOptions<TableElement>, 'getCoreRowModel'>, count: number) {
  const { orderBy, setOrderBy } = useSortSearchParams();

  // TODO Lazy loading doesn't work anymore in React18
  const sorting = orderByToSortingState(orderBy);

  const { skip, take, nextUrl, previousUrl, getUrlAtPage } = usePaginateSearchParams();

  return {
    tableProps: useReactTable({
      ...tableOptions,
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
      currentPageCount: tableOptions.data.length,
      onLoadMore: (page: string) => {
        /* TODO Lazy loading solution doesn't work anymore in react 18 */
      },
    },
  };
}
