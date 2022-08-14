import { json as remixJson } from '@remix-run/node';
import { useLoaderData as useRemixLoaderData } from '@remix-run/react';
import { serialize, deserialize } from 'superjson';
import type { SuperJSONResult } from 'superjson/dist/types';

export const json = <Data>(data: Data, init?: ResponseInit) => {
  const superJsonResult = serialize(data);
  return remixJson(superJsonResult, init);
};

export const useLoaderData = <Data>() => {
  const loaderData = useRemixLoaderData() as SuperJSONResult;
  return deserialize<Data>(loaderData);
};
