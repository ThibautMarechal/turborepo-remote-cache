import { type ActionFunction, json } from 'remix';
import { requireTokenAuth } from '~/services/authentication.server';
import { insertEvents } from '~/services/events.server';
import type { TurboEvent } from '~/types/vercel/turborepo';
import { upsertSession } from '~/services/session.server';
import { unprocessableEntity } from 'remix-utils';
import { requireTeamParameter } from '~/services/teams.server';

export const action: ActionFunction = async ({ request, params, context }) => {
  const user = await requireTokenAuth(request);
  const team = await requireTeamParameter(request);
  const turboEvents = (await request.json()) as TurboEvent[];
  if (!turboEvents.length) {
    return unprocessableEntity(turboEvents);
  }
  await upsertSession({
    id: turboEvents[0].sessionId,
    teamId: team.id,
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
