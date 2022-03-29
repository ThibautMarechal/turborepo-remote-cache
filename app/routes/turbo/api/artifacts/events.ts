import { type ActionFunction, json } from 'remix';
import { getTurboContext } from '~/utils/turboContext';
import { requireTokenAuth } from '~/services/authentication.server';
import { saveEvents } from '~/services/events.server';

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);
  const turboCtx = getTurboContext({ request, params, context }, user);

  await saveEvents(turboCtx, await request.json());
  return json(undefined);
};
