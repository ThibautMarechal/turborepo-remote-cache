import type { ActionFunction } from 'remix';
import { type LoaderFunction, useActionData } from 'remix';
import { formAction } from 'remix-forms';
import copy from 'copy-to-clipboard';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'remix-domains';
import { Form } from '~/component/Form';
import { generateToken } from '~/services/tokens.server';
import { useCurrentUser } from '~/context/CurrentUser';
import ClipboardCopyIcon from '@heroicons/react/outline/ClipboardCopyIcon';

const schema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(50),
});

const mutation = makeDomainFunction(schema)(async ({ userId, name }) => await generateToken(userId, name).then(([token]) => token));

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return null;
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return await formAction({
    request,
    schema,
    mutation,
  });
};

export default function New() {
  const data = useActionData<string>();
  const user = useCurrentUser();
  return (
    <div className="flex justify-center">
      {data ? (
        <div className="m-5 flex flex-col gap-5">
          <h2 className="text-2xl font-bold mb-2">Here is your new turborepo token</h2>
          <p>
            <a className="text-primary" target="_blank" href="https://turborepo.org/docs/ci/github-actions#remote-caching" rel="noreferrer">
              How to use this token ?
            </a>
            <br />
            We will only show it once. Be sure to remember your token !
          </p>
          <input className="input w-full text-center" value={data} readOnly />
          <button type="button" className="btn w-full btn-primary" onClick={() => copy(data)}>
            <ClipboardCopyIcon className="text-secondary w-6 h-6 mr-2" />
            Copy to clipboard
          </button>
        </div>
      ) : (
        <Form schema={schema} hiddenFields={['userId']} values={{ userId: user?.id }} />
      )}
    </div>
  );
}
