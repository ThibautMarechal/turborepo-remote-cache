import { json, type LoaderFunction } from '@remix-run/node';
import { ToVercelToken } from '~/mapper/token';
import { getToken } from '~/services/tokens.server';
import { allowMethods, METHOD } from '~/utils/method';

// Mirrors Vercel's GET /v5/user/tokens/current, used by the turbo CLI to validate a token
export const loader: LoaderFunction = async ({ request }) => {
  allowMethods(request, METHOD.GET);
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s/, '');
  if (!bearer) {
    return json({ error: { code: 'forbidden', message: 'Not authorized', invalidToken: false } }, { status: 403 });
  }
  try {
    const token = await getToken(bearer);
    return json({ token: ToVercelToken(token) });
  } catch (error) {
    return json({ error: { code: 'forbidden', message: 'The token is invalid', invalidToken: true } }, { status: 403 });
  }
};
