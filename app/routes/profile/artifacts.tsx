import { type LoaderFunction } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { getArtifactsByUser, getArtifactsCountByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getArtifactsByUser(user.id, skip, take, orderBy), getArtifactsCountByUser(user.id)]);
  return {
    items,
    count,
  };
};

export default function Artifacts() {
  const { items, count } = useTablePageLoaderData<Awaited<ReturnType<typeof getArtifactsByUser>>[number]>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title="My artifacts" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
