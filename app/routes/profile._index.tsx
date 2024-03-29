import type { LoaderFunction } from '@remix-run/node';
import NoSsr from '~/component/NoSsr';
import StorageStats from '~/component/StorageStats';
import TimeSavedStats from '~/component/TimeSavedStats';
import UserCard from '~/component/UserCard';
import UserStats from '~/component/UserStats';
import { useCurrentUser } from '~/context/CurrentUser';
import { getArtifactsCount, getArtifactsSize } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTimeSavedByMonth, type TimeSavedByMonth } from '~/services/events.server';
import { getSessionsCount } from '~/services/session.server';
import { getTokensCount } from '~/services/tokens.server';
import { getUserDetail } from '~/services/users.server';
import { SourceType } from '~/types/vercel/turborepo';
import { json, useLoaderData } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request }) => {
  const { id: userId } = await requireCookieAuth(request);
  const [user, sessions, artifacts, artifactsSize, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUserDetail(userId),
    getSessionsCount({ userId }),
    getArtifactsCount({ userId }),
    getArtifactsSize({ userId }),
    getTokensCount({ userId }),
    getTimeSavedByMonth(SourceType.LOCAL, { userId }),
    getTimeSavedByMonth(SourceType.REMOTE, { userId }),
  ]);
  return json({
    user,
    sessions,
    artifacts,
    artifactsSize,
    tokens,
    savedLocally,
    savedRemotely,
  });
};

export default function Profile() {
  const { sessions, artifacts, tokens, artifactsSize, savedLocally, savedRemotely } = useLoaderData<{
    sessions: number;
    artifacts: number;
    tokens: number;
    artifactsSize: number;
    savedLocally: TimeSavedByMonth[];
    savedRemotely: TimeSavedByMonth[];
  }>();
  const user = useCurrentUser();
  if (!user) {
    return null;
  }
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <UserCard user={user} editable={!user.isExternal} baseRoute={`/profile`} />
      <UserStats userId={user.id} sessions={sessions} artifacts={artifacts} tokens={tokens} />
      <StorageStats size={artifactsSize} />
      <NoSsr>
        <TimeSavedStats local={savedLocally} remote={savedRemotely} />
      </NoSsr>
    </div>
  );
}
