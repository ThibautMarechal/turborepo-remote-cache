import type { ActionFunction, LoaderFunction } from 'remix';
import { redirect } from 'remix';
import { createUser, getNumberOfUser } from '~/services/users.server';

export const action: ActionFunction = async ({ request, params, context }) => {
  const formData = await request.formData();
  await createUser({
    name: formData.get('name') as string,
    username: formData.get('username') as string,
    email: formData.get('email') as string,
  });
  return null;
};

export const loader: LoaderFunction = async ({ request, params, context }) => {
  if ((await getNumberOfUser()) > 0) {
    throw redirect('/');
  }
  return null;
};

export default function Index() {
  return (
    <div>
      <h1>Create your first user</h1>
      <form method="POST">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" />
        <label htmlFor="username">Username</label>
        <input id="username" name="username" />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" />
        <button>Create</button>
      </form>
    </div>
  );
}
