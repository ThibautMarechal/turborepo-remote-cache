import type { ActionFunction, LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = ({ request, params, context }) => {
  return new Response(null, { status: 418 });
};
export const actions: ActionFunction = ({ request, params, context }) => {
  return new Response(null, { status: 418 });
};
