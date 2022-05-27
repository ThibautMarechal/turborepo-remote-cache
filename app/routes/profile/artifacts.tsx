import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/useArtifactsTable';
import { getArtifactsByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  return await getArtifactsByUser(user.id as string);
};

export default function Artifacts() {
  const artifacts = useLoaderData<Awaited<ReturnType<typeof getArtifactsByUser>>>();

  const tableProps = useArtifactsTable(artifacts);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
