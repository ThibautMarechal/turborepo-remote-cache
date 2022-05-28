import type { Team } from '@prisma/client';
import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { getArtifactsByTeam, getArtifactsCountByTeam } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getTeam } from '~/services/teams.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const [team, artifacts, count] = await Promise.all([getTeam(params.id as string), getArtifactsByTeam(params.id as string), getArtifactsCountByTeam(params.id as string)]);
  return { team, artifacts, count };
};

export default function Artifacts() {
  const { team, artifacts, count } = useLoaderData<{ artifacts: Awaited<ReturnType<typeof getArtifactsByTeam>>; team: Team; count: number }>();
  const tableProps = useArtifactsTable(artifacts);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title={`${team.name}'s artifacts`} count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={artifacts.length} />
    </>
  );
}
