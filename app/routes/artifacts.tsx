import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/useArtifactsTable';
import { deleteArtifact, getArtifact, getArtifacts } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { CacheStorage } from '~/services/storage.server';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  return await getArtifacts();
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const storage = new CacheStorage();
  const formData = await request.formData();
  const artifactId = formData.get('id');
  invariant(typeof artifactId === 'string', 'artifactId must be a string');
  const artifact = await getArtifact(artifactId);
  await Promise.all([storage.removeMeta(artifact), storage.removeArtifact(artifact), deleteArtifact(artifactId)]);
  return null;
};

export default function Artifacts() {
  const artifacts = useLoaderData<Awaited<ReturnType<typeof getArtifacts>>>();

  const tableProps = useArtifactsTable(artifacts);
  return (
    <div className="flex">
      <Table {...tableProps} />
    </div>
  );
}
