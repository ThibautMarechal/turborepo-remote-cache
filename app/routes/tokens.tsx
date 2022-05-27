import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import {} from '~/hooks/useArtifactsTable';
import { useTokensTable } from '~/hooks/useTokensTable';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokens, revokeToken } from '~/services/tokens.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const tokens = await getTokens();
  return tokens;
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const formData = await request.formData();
  await revokeToken(formData.get('id') as string);
  return null;
};

export default function Artifacts() {
  const tokens = useLoaderData<Awaited<ReturnType<typeof getTokens>>>();

  const tableProps = useTokensTable(tokens);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
