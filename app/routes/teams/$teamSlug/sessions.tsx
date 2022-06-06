import type { Team } from '@prisma/client';
import { type LoaderFunction } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessions, getSessionsCount } from '~/services/session.server';
import { getTeamBySlug } from '~/services/teams.server';
import type { SessionDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const { take, skip } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  const [items, count] = await Promise.all([getSessions({ teamId: team.id, skip, take, orderBy }), getSessionsCount({ teamId: team.id })]);
  return {
    items,
    team,
    count,
  };
};

export default function New() {
  const { items, team, count } = useTablePageLoaderData<SessionDetail, { team: Team }>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title={`${team.name}'s sessions`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
