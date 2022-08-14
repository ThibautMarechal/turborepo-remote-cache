import { useLoaderData, type LoaderFunction } from 'remix';
import TimeSavedStats from '~/component/TimeSavedStats';
import UserCard from '~/component/UserCard';
import UserStats from '~/component/UserStats';
import { useCurrentUser } from '~/context/CurrentUser';
import { getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import type { TimeSavedByMonth } from '~/services/events.server';
import { getTimeSavedByMonth } from '~/services/events.server';
import { getSessionsCount } from '~/services/session.server';
import { getTokensCount } from '~/services/tokens.server';
import { getUserDetail } from '~/services/users.server';
import { SourceType } from '~/types/vercel/turborepo';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { id: userId } = await requireCookieAuth(request);
  const [user, sessions, artifacts, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUserDetail(userId),
    getSessionsCount({ userId }),
    getArtifactsCount({ userId }),
    getTokensCount({ userId }),
    getTimeSavedByMonth(SourceType.LOCAL, { userId }),
    getTimeSavedByMonth(SourceType.REMOTE, { userId }),
  ]);
  return {
    user,
    sessions,
    artifacts,
    tokens,
    savedLocally,
    savedRemotely,
  };
};

export default function Index() {
  const { sessions, artifacts, tokens, savedLocally, savedRemotely } = useLoaderData<{
    sessions: number;
    artifacts: number;
    tokens: number;
    savedLocally: TimeSavedByMonth[];
    savedRemotely: TimeSavedByMonth[];
  }>();
  const user = useCurrentUser();
  if (!user) {
    return null;
  }
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <UserCard user={user} editable baseRoute={`/profile`} />
      <UserStats userId={user.id} sessions={sessions} artifacts={artifacts} tokens={tokens} />
      <TimeSavedStats local={savedLocally} remote={savedRemotely} />
    </div>
  );
}
