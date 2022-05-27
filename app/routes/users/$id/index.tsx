import { useLoaderData, type LoaderFunction } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserDetail } from '~/services/users.server';
import omit from 'lodash/omit';
import UserStats from '~/component/UserStats';
import UserCard from '~/component/UserCard';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const user = await getUserDetail(params.id as string);
  return omit(user, 'passwordHash');
};

export default function User() {
  const user = useLoaderData<Awaited<ReturnType<typeof getUserDetail>>>();
  return (
    <div className="flex flex-wrap justify-center gap-2 m-2">
      <UserCard user={user} />
      <UserStats user={user} stats={['sessions', 'artifacts', 'tokens']} />
    </div>
  );
}
