import { useSearchParams } from 'remix';
import { createSearchParams } from 'react-router-dom';

export function usePaginateSearchParams() {
  const [searchParam] = useSearchParams();
  const take = Number.parseInt(searchParam.get('take') || '10');
  const skip = Number.parseInt(searchParam.get('skip') || '0');
  const restOfParams = createSearchParams();
  searchParam.forEach((value, key) => {
    if (key !== 'take' && key !== 'skip') {
      restOfParams.set(key, value);
    }
  });
  const getUrlAtPage = (page: number) => `?${createSearchParams([['skip', (page * take).toString()], ['take', take.toString()], ...restOfParams.entries()])}`;
  const previousUrl = `?${createSearchParams([['skip', (skip - take).toString()], ['take', take.toString()], ...restOfParams.entries()])}`;
  const nextUrl = `?${createSearchParams([['skip', (skip + take).toString()], ['take', take.toString()], ...restOfParams.entries()])}`;
  return { take, skip, previousUrl, nextUrl, getUrlAtPage } as const;
}
