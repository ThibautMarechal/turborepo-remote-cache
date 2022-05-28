import type { Team } from '@prisma/client';
import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { requireCookieAuth } from '~/services/authentication.server';

import { getSessionsByTeam, getSessionsByTeamCount } from '~/services/session.server';
import { getTeam } from '~/services/teams.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { take, skip } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [team, sessions, count] = await Promise.all([
    getTeam(params.id as string),
    getSessionsByTeam(params.id as string, skip, take, orderBy),
    getSessionsByTeamCount(params.id as string),
  ]);
  return {
    sessions,
    team,
    count,
  };
};

export default function New() {
  const { sessions, team, count } = useLoaderData<{ sessions: Awaited<ReturnType<typeof getSessionsByTeam>>; team: Team; count: number }>();
  const tableProps = useSessionsTable(sessions);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title={`${team.name}'s sessions`} count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={sessions.length} />
    </>
  );
}
