import type { ActionFunction } from 'remix';
import { json, type LoaderFunction } from 'remix';
import { formAction } from 'remix-forms';
import { z } from 'zod';
import { requireCookieAuth } from '~/services/authentication.server';
import { createUser, getUsers } from '~/services/users.server';
import { makeDomainFunction } from 'remix-domains';
import Form from '~/component/Form';

const schema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().min(1).email(),
  name: z.string().min(1).max(50),
  password: z.string().min(1).max(50),
});

const mutation = makeDomainFunction(schema)(async ({ password, ...user }) => await createUser(user, password));

export const loader: LoaderFunction = async ({ request }) => {
  await requireCookieAuth(request);
  return json(await getUsers());
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return formAction({
    request,
    schema,
    mutation,
    successPath: '/users',
  });
};

export default function New() {
  return (
    <div className="flex justify-center">
      <Form schema={schema} />
    </div>
    // <form method="POST">
    //   <h2>Create a new user</h2>
    //   <div className="form-control w-full">
    //     <label className="label">
    //       <span className="label-text">Username</span>
    //     </label>
    //     <input type="text" name="username" required autoFocus className="input input-bordered w-full" />
    //   </div>
    //   <div className="form-control w-full">
    //     <label className="label">
    //       <span className="label-text">Name</span>
    //     </label>
    //     <input type="text" name="name" required className="input input-bordered w-full" />
    //   </div>
    //   <div className="form-control w-full">
    //     <label className="label">
    //       <span className="label-text">Email</span>
    //     </label>
    //     <input type="email" name="email" required className="input input-bordered w-full" />
    //   </div>
    //   <div className="form-control w-full">
    //     <label className="label">
    //       <span className="label-text">Password</span>
    //     </label>
    //     <input type="password" name="password" required className="input input-bordered w-full" />
    //   </div>
    //   <div className="form-control w-full mt-3">
    //     <button className="btn btn-primary">Log In</button>
    //   </div>
    // </form>
  );
}
