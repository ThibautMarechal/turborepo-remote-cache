import { data, useLoaderData as useRouterLoaderData, useFetcher as useRouterFetcher } from 'react-router';
import * as React from 'react';
import { serialize, deserialize, type SuperJSONResult } from 'superjson';

export const json = <Data>(value: Data, init?: ResponseInit) => {
  const superJsonResult = serialize(value);
  return data(superJsonResult, init);
};

export const useLoaderData = <Data>() => {
  const loaderData = useRouterLoaderData() as SuperJSONResult;
  return React.useMemo(() => deserialize<Data>(loaderData), [loaderData]);
};

export const useFetcher = <Data>() => {
  const fetcher = useRouterFetcher();
  const data = React.useMemo(() => (fetcher.data ? deserialize<Data>(fetcher.data as SuperJSONResult) : (fetcher.data as undefined)), [fetcher.data]);
  return {
    ...fetcher,
    data,
  };
};
