import type { User } from '@prisma/client';
import { type LoaderFunction } from 'remix';
import TablePage from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { getArtifactsByUser, getArtifactsCountByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUser } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [user, items, count] = await Promise.all([
    getUser(params.id as string),
    getArtifactsByUser(params.id as string, skip, take, orderBy),
    getArtifactsCountByUser(params.id as string),
  ]);
  return {
    user,
    items,
    count,
  };
};

export default function Artifacts() {
  const { items, user, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getArtifactsByUser>>[number], { user: User }>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title={`${user.name}'s artifacts`} count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
