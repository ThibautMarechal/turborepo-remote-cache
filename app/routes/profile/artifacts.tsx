import { type LoaderFunction } from 'remix';
import { TablePage } from '~/component/TablePage';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { useTablePageLoaderData } from '~/hooks/useTablePageLoaderData';
import { getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import type { ArtifactDetail } from '~/types/prisma';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [items, count] = await Promise.all([getArtifacts({ userId: user.id, skip, take, orderBy }), getArtifactsCount({ userId: user.id })]);
  return {
    items,
    count,
  };
};

export default function Artifacts() {
  const { items, count } = useTablePageLoaderData<ArtifactDetail>();
  const { tableProps, paginationProps } = useArtifactsTable(items, count);
  return <TablePage title="My artifacts" count={count} tableProps={tableProps} paginationProps={paginationProps} />;
}
