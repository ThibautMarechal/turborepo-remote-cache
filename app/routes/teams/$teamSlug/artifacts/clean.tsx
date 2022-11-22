import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { formAction } from '~/formAction';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { makeDomainFunction } from 'domain-functions';
import { Form } from '~/component/Form';
import { requireTeamOwner } from '~/roles/rights';
import { CleanPeriod } from '~/clean/CleanPeriod';
import { deleteArtifactByPeriod } from '~/services/artifact.server';
import { getTeamBySlug } from '~/services/teams.server';

const schema = z.object({
  period: z.enum([CleanPeriod.DAY, CleanPeriod.WEEK, CleanPeriod.MONTH, CleanPeriod.YEAR]),
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  return null;
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);

  const mutation = makeDomainFunction(schema)(({ period }) => deleteArtifactByPeriod(period, { teamId: team.id }));

  return formAction({
    request,
    schema,
    mutation,
    successPath: '..',
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
