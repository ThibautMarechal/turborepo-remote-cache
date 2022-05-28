import { useSearchParams } from 'remix';
import { createSearchParams } from 'react-router-dom';
import type { OrderBy } from '~/utils/sort';

export function useSortSearchParams(): {
  orderBy: OrderBy[];
  setOrderBy: (orderBy: OrderBy[]) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderBy = JSON.parse(searchParams.get('orderBy') || '[]') as OrderBy[];
  const restOfParams = createSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'orderBy' && key !== 'take' && key !== 'skip') {
      restOfParams.set(key, value);
    }
  });
  return {
    orderBy,
    setOrderBy: (newOrderBy: OrderBy[]) => setSearchParams(createSearchParams([['orderBy', JSON.stringify(newOrderBy)]])),
  };
}
