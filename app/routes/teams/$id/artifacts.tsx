import { useLoaderData, type LoaderFunction } from 'remix';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/useArtifactsTable';
import { getArtifactsByTeam } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const artifacts = await getArtifactsByTeam(params.id as string);
  return artifacts;
};

export default function Artifacts() {
  const artifacts = useLoaderData<Awaited<ReturnType<typeof getArtifactsByTeam>>>();

  const tableProps = useArtifactsTable(artifacts);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
