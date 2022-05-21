import { type ActionFunction, json } from 'remix';
import { getTurboContext } from '~/utils/turboContext';
import { requireTokenAuth } from '~/services/authentication.server';
import { insertEvents } from '~/services/events.server';
import { TurboEvent } from '~/types/turborepo';
import { upsertSession } from '~/services/session.server';
import { unprocessableEntity } from 'remix-utils';

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);
  const turboCtx = getTurboContext({ request, params, context }, user);

  const turboEvents = (await request.json()) as TurboEvent[];
  if (!turboEvents.length) {
    return unprocessableEntity(turboEvents);
  }
  await upsertSession({
    id: turboEvents[0].sessionId,
    teamId: (turboCtx.teamId ?? turboCtx.teamSlug) as string,
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
