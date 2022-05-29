import { useLoaderData, type LoaderFunction } from 'remix';
import UserCard from '~/component/UserCard';
import UserStats from '~/component/UserStats';
import { getArtifactsCountByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessionsByUserCount } from '~/services/session.server';
import { getTokensByUserCount } from '~/services/tokens.server';
import { getUserDetail } from '~/services/users.server';
import type { UserDetail } from '~/types/prisma';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { id: userId } = await requireCookieAuth(request);
  const [user, sessions, artifacts, tokens] = await Promise.all([
    getUserDetail(userId),
    getSessionsByUserCount(userId),
    getArtifactsCountByUser(userId),
    getTokensByUserCount(userId),
  ]);
  return {
    user,
    sessions,
    artifacts,
    tokens,
  };
};

export default function Index() {
  const { user, sessions, artifacts, tokens } = useLoaderData<{ user: UserDetail; sessions: number; artifacts: number; tokens: number }>();
  return (
    <div className="flex flex-wrap justify-center gap-2 m-2">
      <UserCard user={user} />
      <UserStats sessions={sessions} artifacts={artifacts} tokens={tokens} />
    </div>
  );
}
