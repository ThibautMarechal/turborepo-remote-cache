import type { LoaderFunction } from 'remix';
import { type ActionFunction, json } from 'remix';
import { requireTokenAuth } from '~/services/authentication.server';
import { insertEvents } from '~/services/events.server';
import type { TurboEvent } from '~/types/vercel/turborepo';
import { upsertSession } from '~/services/session.server';
import { unprocessableEntity } from 'remix-utils';
import { getTeamFromRequest } from '~/services/teams.server';
import { allowMethods, METHOD } from '~/utils/method';
import { methodNotAllowed } from '~/utils/response';

export const action: ActionFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET, METHOD.POST);
  const user = await requireTokenAuth(request);
  const team = await getTeamFromRequest(request);
  const turboEvents = (await request.json()) as TurboEvent[];
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
  return json(undefined);
};

export const loader: LoaderFunction = async ({ request, params, context }) => {
  allowMethods(request, METHOD.GET, METHOD.POST);
  return methodNotAllowed();
};
