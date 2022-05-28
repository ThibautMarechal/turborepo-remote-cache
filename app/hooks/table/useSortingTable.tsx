import type { ColumnDef, Table, ReactTableGenerics } from '@tanstack/react-table';
import { getCoreRowModel, useTableInstance } from '@tanstack/react-table';
import { orderByToSortingState, sortingStateToOrderBy } from '~/utils/sort';
import { useSortSearchParams } from '~/hooks/useSortSearchParams';

export function useSortingTable<TableElement extends ReactTableGenerics>(table: Table<TableElement>, columns: ColumnDef<TableElement>[], data: TableElement['Row'][]) {
  const { orderBy, setOrderBy } = useSortSearchParams();
  const sorting = orderByToSortingState(orderBy);

  return useTableInstance(table, {
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: (s) => {
      const newSorting = typeof s === 'function' ? s(sorting) : s;
      setOrderBy(sortingStateToOrderBy(newSorting));
    },
    getCoreRowModel: getCoreRowModel(),
  });
}
