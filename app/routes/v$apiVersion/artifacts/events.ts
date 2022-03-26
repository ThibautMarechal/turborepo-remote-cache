import type { ActionFunction } from 'remix';
import { getTurboContext, validateToken } from '~/helpers/turboContext';
import { saveEvents } from '~/mongo/events';

export const action: ActionFunction = async ({ request, params, context }) => {
  const turboCtx = getTurboContext({ request, params, context });
  validateToken(turboCtx);
  await saveEvents(turboCtx, await request.json());
  return new Response(null, { status: 200 });
};
