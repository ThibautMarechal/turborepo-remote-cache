import { json } from 'remix';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import invariant from 'tiny-invariant';
import { sessionStorage } from '~/services/cookieSession';
import { User } from '~/types/User';
import { getUserId } from './token.server';
import { getUser } from './users.server';

export const authenticator = new Authenticator<User>(sessionStorage);

export function requireCookieAuth(request: Request) {
  const url = new URL(request.url);
  return authenticator.isAuthenticated(request, {
    failureRedirect: `/login?redirect_to=${encodeURI(url.pathname + url.search)}`,
  });
}

export async function requireTokenAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s/, '') ?? undefined;
  if (!token) {
    throw json(undefined, 403);
  }
  try {
    const userId = await getUserId(token);
    return await getUser(userId);
  } catch (error) {
    throw json(undefined, 403);
  }
}

function login(username: string, _password: string): User {
  // TODO handle login
  return { username, id: username };
}

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get('username');
    const password = form.get('password');
    invariant(username && username.toString(), 'Missing username');
    invariant(password && password.toString(), 'Missing password');
    return await login(username?.toString(), password.toString());
  }),
  'user-pass',
);
