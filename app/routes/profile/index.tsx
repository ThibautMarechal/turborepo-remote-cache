import { useLoaderData, type LoaderFunction } from 'remix';
import TimeSavedStats from '~/component/TimeSavedStats';
import UserCard from '~/component/UserCard';
import UserStats from '~/component/UserStats';
import { useCurrentUser } from '~/context/CurrentUser';
import { getArtifactsCountByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTimeSaved } from '~/services/events.server';
import { getSessionsByUserCount } from '~/services/session.server';
import { getTokensByUserCount } from '~/services/tokens.server';
import { getUserDetail } from '~/services/users.server';
import { SourceType } from '~/types/vercel/turborepo';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { id: userId } = await requireCookieAuth(request);
  const [user, sessions, artifacts, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUserDetail(userId),
    getSessionsByUserCount(userId),
    getArtifactsCountByUser(userId),
    getTokensByUserCount(userId),
    getTimeSaved(SourceType.LOCAL, { userId }),
    getTimeSaved(SourceType.REMOTE, { userId }),
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
    savedLocally: number;
    savedRemotely: number;
  }>();
  const user = useCurrentUser();
  if (!user) {
    return null;
  }
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <UserCard user={user} />
      <UserStats userId={user.id} sessions={sessions} artifacts={artifacts} tokens={tokens} />
      <TimeSavedStats local={savedLocally} remote={savedRemotely} />
    </div>
  );
}
