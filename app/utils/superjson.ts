import { json as remixJson } from '@remix-run/node';
import { useLoaderData as useRemixLoaderData, useFetcher as useRemixFetcher } from '@remix-run/react';
import * as React from 'react';
import { serialize, deserialize, type SuperJSONResult } from 'superjson';

export const json = <Data>(data: Data, init?: ResponseInit) => {
  const superJsonResult = serialize(data);
  return remixJson(superJsonResult, init);
};

export const useLoaderData = <Data>() => {
  const loaderData = useRemixLoaderData() as SuperJSONResult;
  return React.useMemo(() => deserialize<Data>(loaderData), [loaderData]);
};

export const useFetcher = <Data>() => {
  const fetcher = useRemixFetcher();
  const data = React.useMemo(() => (fetcher.data ? deserialize<Data>(fetcher.data as SuperJSONResult) : (fetcher.data as undefined)), [fetcher.data]);
  return {
    ...fetcher,
    data,
  };
};
