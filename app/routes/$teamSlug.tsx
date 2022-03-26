import { type LoaderFunction, useLoaderData, json } from 'remix';
import invariant from 'tiny-invariant';
import { formatDate, formatDuration } from '~/helpers/intl';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessions, getTimeSaved } from '~/services/events.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  invariant(params.teamSlug);
  const timeSaved = await getTimeSaved(params.teamSlug);
  if (timeSaved.length === 0) {
    throw new Response(null, { status: 404 });
  }
  const sessions = await getSessions(params.teamSlug);
  return json({ sessions, timeSaved: timeSaved[0] });
};

export default function Team() {
  const { sessions, timeSaved } = useLoaderData();

  return (
    <div>
      <h1>{timeSaved.teamSlug}</h1>
      <h2>Statistics</h2>
      <p>
        Local hits: {timeSaved.localHits}
        <br />
        Local timeSaved: {formatDuration(timeSaved.localDuration)}
        <br />
        Remote hits: {timeSaved.remoteHits}
        <br />
        Remote timeSaved: {formatDuration(timeSaved.remoteDuration)}
        <br />
      </p>
      <h2>Sessions</h2>
      <ul>
        {sessions.map((session: any) => (
          <li key={session.sessionId}>
            <details>
              <summary>{formatDate(session.date)}</summary>
              sessionId: {session.sessionId}
              <br />
              Local hits: {session.localHits}
              <br />
              Local timeSaved: {formatDuration(session.localDuration)}
              <br />
              Remote hits: {session.remoteHits}
              <br />
              Remote timeSaved: {formatDuration(session.remoteDuration)}
              <br />
              <br />
              <ul>
                {session.events.map((event: any) => (
                  <li key={`${session.sessionId}_${event.hash}_${event.source}`}>
                    <details>
                      <summary>{event.hash}</summary>
                      duration: {formatDuration(event.duration)}
                      <br />
                      event: {event.event}
                      <br /> hash: {event.hash}
                      <br /> sessionId: {event.sessionId}
                      <br /> source: {event.source}
                      <br /> teamSlug: {event.teamSlug}
                      <br /> date: {formatDate(event.date)}
                    </details>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
