import type { LoaderFunction, ActionFunction } from '@remix-run/node';

import { requireTokenAuth } from '~/services/authentication.server';
import { insertEvents } from '~/services/events.server';
import type { TurboEvent } from '~/types/vercel/turborepo';
import { upsertSession } from '~/services/session.server';
import { unprocessableEntity } from 'remix-utils';
import { getTeamFromRequest } from '~/services/teams.server';
import { allowMethods, METHOD } from '~/utils/method';
import { accepted, methodNotAllowed } from '~/utils/response';
import debug from 'debug';

const Debugger = debug('turbo-api-events');

export const action: ActionFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET, METHOD.POST);
  const user = await requireTokenAuth(request);
  const team = await getTeamFromRequest(request);
  const turboEvents = (await request.json()) as TurboEvent[];
  Debugger('Receiving evets %o', turboEvents);
  if (!turboEvents.length) {
    return unprocessableEntity(turboEvents);
  }
  await upsertSession({
    id: turboEvents[0].sessionId,
    teamId: team?.id ?? null,
    userId: user.id,
  });
  await insertEvents(
    turboEvents.map((event) => ({
      duration: event.duration,
      eventType: event.event,
      hash: event.hash,
      sessionId: event.sessionId,
      sourceType: event.source,
    })),
  );
  return accepted();
};

export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET, METHOD.POST);
  return methodNotAllowed();
};
