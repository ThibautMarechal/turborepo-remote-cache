import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import type { Team } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { forbidden } from 'remix-utils';
import invariant from 'tiny-invariant';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { isAdmin, requireTeamOwner } from '~/roles/rights';
import { deleteArtifact, getArtifact, getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { CacheStorage } from '~/services/storage.server';
import { getTeamBySlug } from '~/services/teams.server';
import type { ArtifactDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getArtifacts({ teamId: team.id, skip, take, orderBy }), getArtifactsCount({ teamId: team.id })]);
  return json({ team, items, count });
};

export const action: ActionFunction = async ({ request, params }) => {
  const currentUser = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(currentUser, team.id);
  const formData = await request.formData();
  const artifactId = formData.get('id');
  invariant(typeof artifactId === 'string', 'artifactId must be a string');
  const storage = new CacheStorage();
  const artifact = await getArtifact(artifactId);
  if (!isAdmin(currentUser) && artifact.teamId !== team.id) {
    throw forbidden("Artifact doesn't belong to the team");
  }
  await Promise.all([storage.removeArtifact(artifact), deleteArtifact(artifactId)]);
  return null;
};

export default function Artifacts() {
  const { team, items, count } = useTablePageLoaderData<ArtifactDetail, { team: Team }>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return (
    <>
      <TablePage title={`${team.name}'s artifacts`} count={count} tableProps={tableProps} paginationProps={paginationProps} />
      <Link to="./clean" className="fixed btn btn-circle btn-primary bottom-5 right-5">
        <TrashIcon className="w-8" />
      </Link>
    </>
  );
}
