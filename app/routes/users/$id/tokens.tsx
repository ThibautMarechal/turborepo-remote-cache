import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import {} from '~/hooks/useArtifactsTable';
import { useTokensTable } from '~/hooks/useTokensTable';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTokensByUser } from '~/services/tokens.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const tokens = await getTokensByUser(params.id as string);
  return tokens;
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
