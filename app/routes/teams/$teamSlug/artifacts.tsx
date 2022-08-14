import type { Team } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireAdmin } from '~/roles/rights';
import { getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeamBySlug } from '~/services/teams.server';
import type { ArtifactDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  requireAdmin(user);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  const [items, count] = await Promise.all([getArtifacts({ teamId: params.id, skip, take, orderBy }), getArtifactsCount({ teamId: params.id })]);
  return json({ team, items, count });
};

export default function Artifacts() {
  const { team, items, count } = useTablePageLoaderData<ArtifactDetail, { team: Team }>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title={`${team.name}'s artifacts`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
