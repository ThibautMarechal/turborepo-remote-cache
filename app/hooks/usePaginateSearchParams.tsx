import { useSearchParams } from '@remix-run/react';
import { createSearchParams } from 'react-router-dom';

export function usePaginateSearchParams() {
  const [searchParams] = useSearchParams();
  const take = Number.parseInt(searchParams.get('take') || '20');
  const skip = Number.parseInt(searchParams.get('skip') || '0');
  const restOfParams = createSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'take' && key !== 'skip') {
      restOfParams.set(key, value);
    }
  });
  const getUrlAtPage = (page: number) => `?${createSearchParams([['skip', (page * take).toString()], ['take', take.toString()], ...restOfParams.entries()])}`;
  const previousUrl = `?${createSearchParams([['skip', (skip - take).toString()], ['take', take.toString()], ...restOfParams.entries()])}`;
  const nextUrl = `?${createSearchParams([['skip', (skip + take).toString()], ['take', take.toString()], ...restOfParams.entries()])}`;
  return { take, skip, previousUrl, nextUrl, getUrlAtPage } as const;
}
