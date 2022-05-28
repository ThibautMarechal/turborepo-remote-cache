import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { getArtifactsByUser, getArtifactsCountByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [artifacts, count] = await Promise.all([getArtifactsByUser(user.id, skip, take, orderBy), getArtifactsCountByUser(user.id)]);
  return {
    artifacts,
    count,
  };
};

export default function Artifacts() {
  const { artifacts, count } = useLoaderData<{ artifacts: Awaited<ReturnType<typeof getArtifactsByUser>>; count: number }>();
  const tableProps = useArtifactsTable(artifacts);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title="My artifacts" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={artifacts.length} />
    </>
  );
}
