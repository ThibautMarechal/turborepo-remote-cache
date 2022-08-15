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
import { getArtifactsCount } from '~/services/artifact.server';
import { isAdmin } from '~/roles/rights';
import HasRights from '~/component/HasRights';
import { useCurrentUser } from '~/context/CurrentUser';
import { json, useLoaderData } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  const isAdministrator = isAdmin(currentUser);
  const user = await getUserDetailByUsername(params.username as string);
  const [sessions, artifacts, tokens, savedLocally, savedRemotely] = await Promise.all([
    isAdministrator ? getSessionsCount({ userId: user.id }) : 0,
    isAdministrator ? getArtifactsCount({ userId: user.id }) : 0,
    isAdministrator ? getTokensCount({ userId: user.id }) : 0,
    isAdministrator ? getTimeSavedByMonth(SourceType.LOCAL, { userId: user.id as string }) : [],
    isAdministrator ? getTimeSavedByMonth(SourceType.REMOTE, { userId: user.id as string }) : [],
  ]);

  return json({
    user,
    sessions,
    artifacts,
    tokens,
    savedLocally,
    savedRemotely,
  });
};

export default function User() {
  const currentUser = useCurrentUser();
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
      <UserCard user={user} editable={isAdmin(currentUser!)} baseRoute={`/users/${user.username}`} />
      <HasRights predicate={(u) => isAdmin(u)}>
        <UserStats userId={user.id} sessions={sessions} artifacts={artifacts} tokens={tokens} />
        <TimeSavedStats local={savedLocally} remote={savedRemotely} />
      </HasRights>
    </div>
  );
}
