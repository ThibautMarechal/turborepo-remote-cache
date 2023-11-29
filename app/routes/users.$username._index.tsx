import type { LoaderFunction } from '@remix-run/node';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetailByUsername } from '~/services/users.server';
import UserStats from '~/component/UserStats';
import UserCard from '~/component/UserCard';
import { getSessionsCount } from '~/services/session.server';
import type { UserDetail } from '~/types/prisma';
import { getTokensCount } from '~/services/tokens.server';
import TimeSavedStats from '~/component/TimeSavedStats';
import type { TimeSavedByMonth } from '~/services/events.server';
import { getTimeSavedByMonth } from '~/services/events.server';
import { SourceType } from '~/types/vercel/turborepo';
import { getArtifactsCount, getArtifactsSize } from '~/services/artifact.server';
import { isAdmin } from '~/roles/rights';
import HasRights from '~/component/HasRights';
import { useCurrentUser } from '~/context/CurrentUser';
import { json, useLoaderData } from '~/utils/superjson';
import StorageStats from '~/component/StorageStats';
import NoSsr from '~/component/NoSsr';

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  const isAdministrator = isAdmin(currentUser);
  const user = await getUserDetailByUsername(params.username as string);
  const [sessions, artifacts, artifactsSize, tokens, savedLocally, savedRemotely] = await Promise.all([
    isAdministrator ? getSessionsCount({ userId: user.id }) : 0,
    isAdministrator ? getArtifactsCount({ userId: user.id }) : 0,
    isAdministrator ? getArtifactsSize({ userId: user.id }) : 0,
    isAdministrator ? getTokensCount({ userId: user.id }) : 0,
    isAdministrator ? getTimeSavedByMonth(SourceType.LOCAL, { userId: user.id }) : [],
    isAdministrator ? getTimeSavedByMonth(SourceType.REMOTE, { userId: user.id }) : [],
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

export default function User() {
  const currentUser = useCurrentUser();
  const { user, sessions, artifacts, artifactsSize, tokens, savedLocally, savedRemotely } = useLoaderData<{
    user: UserDetail;
    sessions: number;
    artifacts: number;
    artifactsSize: number;
    tokens: number;
    savedLocally: TimeSavedByMonth[];
    savedRemotely: TimeSavedByMonth[];
  }>();
  return (
    <div className="flex w-full justify-center items-center flex-col gap-5 mt-5">
      <UserCard user={user} editable={isAdmin(currentUser!)} baseRoute={`/users/${user.username}`} />
      <HasRights predicate={(u) => isAdmin(u)}>
        <UserStats userId={user.id} sessions={sessions} artifacts={artifacts} tokens={tokens} />
        <StorageStats size={artifactsSize} />
        <NoSsr>
          <TimeSavedStats local={savedLocally} remote={savedRemotely} />
        </NoSsr>
      </HasRights>
    </div>
  );
}
