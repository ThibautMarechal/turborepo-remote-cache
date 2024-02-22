import { redirect } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { OpenIDConnectStrategy } from 'remix-auth-oidc';
import invariant from 'tiny-invariant';
import { sessionStorage } from '~/services/cookie.server';
import { unauthorized } from '~/utils/response';
import { getToken } from './tokens.server';
import { createExternalUser, getUserByUsernameAndPassword, getUserDetail, userExist } from './users.server';
import { ServerRole } from '~/roles/ServerRole';
import debug from 'debug';
import { MicrosoftStrategy } from 'remix-auth-microsoft';

const OIDCDebugger = debug('oidc');
const AZUREADDebugger = debug('azure-ad');

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
  } catch (error) {
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
      if (!user) {
        throw unauthorized();
      }
      return user.id;
    } catch (error) {
      throw unauthorized();
    }
  }),
  'user-pass',
);

if (process.env.OIDC === 'true') {
  const { OIDC_AUTHORIZATION_URL, OIDC_TOKEN_URL, OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_PROFILE_URL } = process.env;
  invariant(OIDC_AUTHORIZATION_URL && OIDC_TOKEN_URL && OIDC_CLIENT_ID && OIDC_CLIENT_SECRET && OIDC_PROFILE_URL);
  const oidc = new OpenIDConnectStrategy(
    {
      authorizationURL: OIDC_AUTHORIZATION_URL,
      callbackURL: '/login/oidc/callback',
      clientID: OIDC_CLIENT_ID,
      clientSecret: OIDC_CLIENT_SECRET,
      tokenURL: OIDC_TOKEN_URL,
    },
    async ({ accessToken }) => {
      // Get the user data from your DB or API using the tokens and profile
      OIDCDebugger(`accessToken: ${accessToken}`);
      try {
        const response = await fetch(OIDC_PROFILE_URL, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });
        OIDCDebugger(`profile status: ${response.status}`);
        if (!response.ok) {
          try {
            const body = await response.text();
            OIDCDebugger(`profile text: ${body}`);
            throw new Response(body, { status: 401 });
          } catch (error) {
            OIDCDebugger(`profile error: ${error}`);
            throw new Response((error as Error).message, { status: 401 });
          }
        }
        const userInfo: { sub: string; email?: string; name?: string; preferred_username?: string } = await response.json();
        OIDCDebugger(`userInfo: ${userInfo}`);
        if (!(await userExist(userInfo.sub))) {
          const email = userInfo.email ?? userInfo.sub;
          const name = userInfo.name ?? userInfo.preferred_username ?? userInfo.sub;
          const username = userInfo.preferred_username ?? userInfo.sub;

          const user = await createExternalUser({ id: userInfo.sub, email, name, username, role: ServerRole.DEVELOPER });
          OIDCDebugger(`userInfo: %o`, user);
        }
        return userInfo.sub;
      } catch (e) {
        OIDCDebugger(e);
        console.error('Error while fetching userinfo', e);
        return '';
      }
    },
  );

  authenticator.use(oidc, 'oidc');
}

if (process.env.AZURE_AD === 'true') {
  const { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID } = process.env;
  invariant(AZURE_AD_CLIENT_ID && AZURE_AD_CLIENT_SECRET && AZURE_AD_TENANT_ID);
  const microsoftStrategy = new MicrosoftStrategy(
    {
      clientId: AZURE_AD_CLIENT_ID,
      clientSecret: AZURE_AD_CLIENT_SECRET,
      tenantId: AZURE_AD_TENANT_ID,
      redirectUri: '/login/azure-ad/callback',
      prompt: 'consent',
    },
    async ({ profile }) => {
      if (!(await userExist(profile.id))) {
        const email = profile.emails?.[0].value ?? profile.id;
        const name = profile.displayName;
        const username = profile.displayName;
        const user = await createExternalUser({ id: profile.id, email, name, username, role: ServerRole.DEVELOPER });
        AZUREADDebugger(`userInfo: %o`, user);
      }
      return profile.id;
    },
  );
  authenticator.use(microsoftStrategy, 'azure-ad');
}
