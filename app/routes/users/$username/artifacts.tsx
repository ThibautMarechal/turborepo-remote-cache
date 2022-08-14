import type { User } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import TablePage from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUserByUsername } from '~/services/users.server';
import type { ArtifactDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';
import { json } from '~/utils/superjson';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const user = await getUserByUsername(params.username as string);
  const [items, count] = await Promise.all([getArtifacts({ userId: user.id, skip, take, orderBy }), getArtifactsCount({ userId: user.id })]);
  return json({
    user,
    items,
    count,
  });
};

export default function Artifacts() {
  const { items, user, count } = useTablePageLoaderData<ArtifactDetail, { user: User }>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title={`${user.name}'s artifacts`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
