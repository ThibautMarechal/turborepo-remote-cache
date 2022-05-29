import { useLoaderData } from 'remix';

export function useTablePageLoaderData<TableElement, AddtionalLoaderData = {}>() {
  return useLoaderData<{ items: TableElement[]; count: number } & AddtionalLoaderData>();
}
