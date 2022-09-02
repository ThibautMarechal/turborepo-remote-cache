import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { OAuth2Strategy } from 'remix-auth-oauth2';
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

if (process.env.OAUTH === 'true') {
  const { OAUTH_AUTHORIZATION_URL, OAUTH_TOKEN_URL, OAUTH_CALLBACK_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = process.env;
  invariant(OAUTH_AUTHORIZATION_URL && OAUTH_TOKEN_URL && OAUTH_CALLBACK_URL && OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET);
  const oauth2 = new OAuth2Strategy(
    {
      authorizationURL: OAUTH_AUTHORIZATION_URL,
      callbackURL: OAUTH_CALLBACK_URL,
      clientID: OAUTH_CLIENT_ID,
      clientSecret: OAUTH_CLIENT_SECRET,
      tokenURL: OAUTH_TOKEN_URL,
    },
    async ({ accessToken, refreshToken, extraParams, profile }) => {
      // Get the user data from your DB or API using the tokens and profile
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      console.log('extraParams', extraParams);
      console.log('profile', profile);
      return profile.id!;
    },
  );

  authenticator.use(oauth2, 'oauth');
}
