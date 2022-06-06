import { redirect } from 'remix';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import invariant from 'tiny-invariant';
import { sessionStorage } from '~/services/cookieSession.server';
import { unauthorized } from '~/utils/response';
import { getToken } from './tokens.server';
import { getUserByUsernameAndPassword, getUserDetail } from './users.server';

export const authenticator = new Authenticator<string>(sessionStorage);

export async function requireCookieAuth(request: Request, redirectOnfail: boolean = true) {
  const url = new URL(request.url);
  const failureRedirect = `/login?redirect_to=${encodeURI(url.pathname + url.search)}`;
  try {
    const userId = await authenticator.isAuthenticated(request, {
      failureRedirect,
    });
    return await getUserDetail(userId);
  } catch (e) {
    if (redirectOnfail) {
      throw redirect(failureRedirect);
    } else {
      throw unauthorized();
    }
  }
}

export async function requireTokenAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s/, '') ?? undefined;
  if (!token) {
    throw unauthorized();
  }
  try {
    const { userId } = await getToken(token);
    return await getUserDetail(userId);
  } catch (error: any) {
    console.warn('Token Auth Error: ', error?.constructor?.name);
    console.warn(error);
    throw unauthorized();
  }
}

authenticator.use(
  new FormStrategy<string>(async ({ form }) => {
    const username = form.get('username');
    const password = form.get('password');
    invariant(username && typeof username === 'string', 'Missing username');
    invariant(password && typeof password === 'string', 'Missing password');
    try {
      const user = await getUserByUsernameAndPassword(username, password);
      return user.id;
    } catch (error) {
      throw unauthorized();
    }
  }),
  'user-pass',
);
