import { useLoaderData } from '~/utils/superjson';

export function useTablePageLoaderData<TableElement, AddtionalLoaderData = {}>() {
  return useLoaderData<{ items: TableElement[]; count: number } & AddtionalLoaderData>();
}
