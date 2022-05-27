import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import Table from '~/component/Table';
import {} from '~/hooks/useArtifactsTable';
import { useTokensTable } from '~/hooks/useTokensTable';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokensByUser, revokeToken } from '~/services/tokens.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  return await getTokensByUser(user.id);
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  const tokenId = formData.get('id')?.toString();
  invariant(typeof tokenId === 'string', 'tokenId must be a string');
  await revokeToken(tokenId);
  return null;
};

export default function Artifacts() {
  const tokens = useLoaderData<Awaited<ReturnType<typeof getTokensByUser>>>();
  const tableProps = useTokensTable(tokens);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
