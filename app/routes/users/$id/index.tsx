import { useLoaderData, type LoaderFunction } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetail } from '~/services/users.server';
import UserStats from '~/component/UserStats';
import UserCard from '~/component/UserCard';
import { getArtifactsCountByUser } from '~/services/artifact.server';
import { getSessionsByUserCount } from '~/services/session.server';
import type { UserDetail } from '~/types/prisma';
import { getTokensByUserCount } from '~/services/tokens.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const [user, sessions, artifacts, tokens] = await Promise.all([
    getUserDetail(params.id as string),
    getSessionsByUserCount(params.id as string),
    getArtifactsCountByUser(params.id as string),
    getTokensByUserCount(params.id as string),
  ]);
  return {
    user,
    sessions,
    artifacts,
    tokens,
  };
};

export default function User() {
  const { user, sessions, artifacts, tokens } = useLoaderData<{ user: UserDetail; sessions: number; artifacts: number; tokens: number }>();
  return (
    <div className="flex flex-wrap justify-center gap-2 m-2">
      <UserCard user={user} />
      <UserStats sessions={sessions} artifacts={artifacts} tokens={tokens} />
    </div>
  );
}
