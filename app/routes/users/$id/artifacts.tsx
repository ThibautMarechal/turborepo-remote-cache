import type { User } from '@prisma/client';
import { useLoaderData, type LoaderFunction } from 'remix';
import ListTitle from '~/component/ListTitle';
import { Pagination } from '~/component/Pagination';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { getArtifactsByUser, getArtifactsCountByUser } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { getUser } from '~/services/users.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [user, artifacts, count] = await Promise.all([
    getUser(params.id as string),
    getArtifactsByUser(params.id as string, skip, take, orderBy),
    getArtifactsCountByUser(params.id as string),
  ]);
  return {
    user,
    artifacts,
    count,
  };
};

export default function Artifacts() {
  const { artifacts, user, count } = useLoaderData<{ artifacts: Awaited<ReturnType<typeof getArtifactsByUser>>; user: User; count: number }>();
  const tableProps = useArtifactsTable(artifacts);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title={`${user.name}'s artifacts`} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={artifacts.length} />
    </>
  );
}
