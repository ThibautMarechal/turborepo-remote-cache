import type { Team } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { TablePage } from '~/component/TablePage';
import { useSessionsTable } from '~/hooks/table/useSessionsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { requireTeamOwner } from '~/roles/rights';
import { requireCookieAuth } from '~/services/authentication.server';
import { getSessions, getSessionsCount } from '~/services/session.server';
import { getTeamBySlug } from '~/services/teams.server';
import type { SessionDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const team = await getTeamBySlug(params.teamSlug as string);
  requireTeamOwner(user, team.id);
  const { take, skip } = getPaginationFromRequest(request);
  const orderBy = getOrderByFromRequest(request);
  const [items, count] = await Promise.all([getSessions({ teamId: team.id, skip, take, orderBy }), getSessionsCount({ teamId: team.id })]);
  return json({
    items,
    team,
    count,
  });
};

export default function Sessions() {
  const { items, team, count } = useTablePageLoaderData<SessionDetail, { team: Team }>();
  const { tableProps, paginationProps } = useSessionsTable(items, count);
  return <TablePage title={`${team.name}'s sessions`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
