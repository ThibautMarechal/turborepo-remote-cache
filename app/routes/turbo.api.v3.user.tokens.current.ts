import { json, type ActionFunction } from '@remix-run/node';
import { getToken, revokeToken } from '~/services/tokens.server';
import { allowMethods, METHOD } from '~/utils/method';

// Mirrors Vercel's DELETE /v3/user/tokens/current, used by `turbo logout --invalidate`
export const action: ActionFunction = async ({ request }) => {
  allowMethods(request, METHOD.DELETE);
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s/, '');
  if (!bearer) {
    return json({ error: { code: 'forbidden', message: 'Not authorized', invalidToken: false } }, { status: 403 });
  }
  let tokenId: string;
  try {
    tokenId = (await getToken(bearer)).id;
  } catch (error) {
    return json({ error: { code: 'forbidden', message: 'The token is invalid', invalidToken: true } }, { status: 403 });
  }
  await revokeToken(tokenId);
  return json({ tokenId });
};
