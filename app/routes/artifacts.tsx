import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireAdmin } from '~/roles/rights';
import { deleteArtifact, getArtifact, getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { CacheStorage } from '~/services/storage.server';
import type { ArtifactDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getArtifacts({ skip, take, orderBy }), getArtifactsCount()]);
  return json({
    items,
    count,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  const formData = await request.formData();
  const artifactId = formData.get('id');
  invariant(typeof artifactId === 'string', 'artifactId must be a string');
  const storage = new CacheStorage();
  const artifact = await getArtifact(artifactId);
  await Promise.all([storage.removeMeta(artifact), storage.removeArtifact(artifact), deleteArtifact(artifactId)]);
  return null;
};

export default function Artifacts() {
  const { items, count } = useTablePageLoaderData<ArtifactDetail>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title="All artifacts" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
