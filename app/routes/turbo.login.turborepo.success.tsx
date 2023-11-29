import type { LoaderFunction } from '@remix-run/node';
import { requireCookieAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return null;
};

export default function Index() {
  return (
    <div className="grid place-content-center p-10 text-2xl text-center">
      Turborepo CLI authorized !
      <br />
      <span className="font-extrabold mt-10 fullturbo">{'>>>'} Full Turbo !</span>
    </div>
  );
}
