import { useLoaderData, type LoaderFunction } from 'remix';
import UserCard from '~/component/UserCard';
import UserStats from '~/component/UserStats';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetail } from '~/services/users.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const { id: userId } = await requireCookieAuth(request);
  return await getUserDetail(userId);
};

export default function Index() {
  const user = useLoaderData<Awaited<ReturnType<typeof getUserDetail>>>();
  return (
    <div className="flex flex-wrap justify-center gap-2 m-2">
      <UserCard user={user} />
      <UserStats user={user} stats={['sessions', 'artifacts', 'tokens']} />
    </div>
  );
}
