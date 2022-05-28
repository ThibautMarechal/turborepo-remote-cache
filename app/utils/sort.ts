import type { SortingState } from '@tanstack/react-table';

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export const DEFAULT_ORDER_BY: OrderBy[] = [{ creationDate: Order.DESC }];

export type OrderBy = Record<string, Order>;

export function getOrderByFromRequest(request: Request): OrderBy[] {
  const { searchParams } = new URL(request.url);
  const orderBy = searchParams.get('orderBy');
  return orderBy ? JSON.parse(orderBy) : DEFAULT_ORDER_BY;
}

export function sortingStateToOrderBy(sorting: SortingState): OrderBy[] {
  return sorting.map<OrderBy>(({ id, desc }) => ({ [id]: desc ? Order.DESC : Order.ASC }));
}

export function orderByToSortingState(orderBy: OrderBy[]): SortingState {
  return orderBy.map((orderBy) => Object.entries(orderBy)[0]).map(([key, direction]) => ({ id: key, desc: direction === Order.DESC }));
}
