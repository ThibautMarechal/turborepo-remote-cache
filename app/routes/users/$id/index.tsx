import { useLoaderData, type LoaderFunction } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetail } from '~/services/users.server';
import UserStats from '~/component/UserStats';
import UserCard from '~/component/UserCard';
import { getArtifactsCountByUser } from '~/services/artifact.server';
import { getSessionsByUserCount } from '~/services/session.server';
import type { UserDetail } from '~/types/prisma';
import { getTokensByUserCount } from '~/services/tokens.server';
import TimeSavedStats from '~/component/TimeSavedStats';
import { getTimeSavedByMonth } from '~/services/events.server';
import { SourceType } from '~/types/vercel/turborepo';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const [user, sessions, artifacts, tokens, savedLocally, savedRemotely] = await Promise.all([
    getUserDetail(params.id as string),
    getSessionsByUserCount(params.id as string),
    getArtifactsCountByUser(params.id as string),
    getTokensByUserCount(params.id as string),
    getTimeSavedByMonth(SourceType.LOCAL, { userId: params.id as string }),
    getTimeSavedByMonth(SourceType.REMOTE, { userId: params.id as string }),
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

export default function User() {
  const { user, sessions, artifacts, tokens, savedLocally, savedRemotely } = useLoaderData<{
    user: UserDetail;
    sessions: number;
    artifacts: number;
    tokens: number;
    savedLocally: TimeSavedByMonth[];
    savedRemotely: TimeSavedByMonth[];
  }>();
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <UserCard user={user} />
      <UserStats userId={user.id} sessions={sessions} artifacts={artifacts} tokens={tokens} />
      <TimeSavedStats local={savedLocally} remote={savedRemotely} />
    </div>
  );
}
