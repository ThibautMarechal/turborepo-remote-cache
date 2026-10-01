import { useLoaderData } from '~/utils/superjson';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- {} is the intersection identity for "no extra loader data"
export function useTablePageLoaderData<TableElement, AddtionalLoaderData = {}>() {
  return useLoaderData<{ items: TableElement[]; count: number } & AddtionalLoaderData>();
}
