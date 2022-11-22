import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { formAction } from '~/formAction';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'domain-functions';
import { Form } from '~/component/Form';
import { requireAdmin } from '~/roles/rights';
import { CleanPeriod } from '~/clean/CleanPeriod';
import { deleteArtifactByPeriod } from '~/services/artifact.server';

const schema = z.object({
  period: z.enum([CleanPeriod.DAY, CleanPeriod.WEEK, CleanPeriod.MONTH, CleanPeriod.YEAR]),
});

const mutation = makeDomainFunction(schema)(({ period }) => deleteArtifactByPeriod(period));

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  return formAction({
    request,
    schema,
    mutation,
    successPath: '/artifacts',
  });
};

export default function New() {
  return (
    <div className="flex justify-center">
      <Form schema={schema}>
        {({ Field, Button }) => (
          <>
            <Field name="period" />
            <Button>Clean</Button>
          </>
        )}
      </Form>
    </div>
  );
}
