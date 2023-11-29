import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { isAdmin } from '~/roles/rights';
import { deleteArtifact, getArtifact, getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { CacheStorage } from '~/services/storage.server';
import type { ArtifactDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { forbidden } from '~/utils/response';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getArtifacts({ userId: user.id, skip, take, orderBy }), getArtifactsCount({ userId: user.id })]);
  return json({
    items,
    count,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const currentUser = await requireCookieAuth(request);
  const formData = await request.formData();
  const artifactId = formData.get('id');
  invariant(typeof artifactId === 'string', 'artifactId must be a string');
  const storage = new CacheStorage();
  const artifact = await getArtifact(artifactId);
  if (!isAdmin(currentUser)) {
    if (artifact.userId !== currentUser.id) {
      throw forbidden("Artifact doesn't belong to you");
    }
    if (artifact.teamId) {
      throw forbidden('Artifact belong to the team');
    }
  }
  await Promise.all([storage.removeArtifact(artifact), deleteArtifact(artifactId)]);
  return null;
};

export default function Artifacts() {
  const { items, count } = useTablePageLoaderData<ArtifactDetail>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return (
    <>
      <TablePage title="My artifacts" count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <Link to="./clean" className="fixed btn btn-circle btn-primary bottom-5 right-5">
        <TrashIcon className="w-8" />
      </Link>
    </>
  );
}
