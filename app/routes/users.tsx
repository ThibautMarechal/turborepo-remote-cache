import { json, type LoaderFunction, useLoaderData } from 'remix';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUsers } from '~/services/users.server';
import type { User } from '~/types/User';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return json(await getUsers());
};

export default function Users() {
  const users = useLoaderData<User[]>();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.username} - {user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
