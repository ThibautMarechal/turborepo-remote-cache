import type { Team } from '@prisma/client';
import { type LoaderFunction } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { getArtifactsByTeam, getArtifactsCountByTeam } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeam } from '~/services/teams.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const [team, items, count] = await Promise.all([getTeam(params.id as string), getArtifactsByTeam(params.id as string), getArtifactsCountByTeam(params.id as string)]);
  return { team, items, count };
};

export default function Artifacts() {
  const { team, items, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getArtifactsByTeam>>[number], { team: Team }>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title={`${team.name}'s artifacts`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
