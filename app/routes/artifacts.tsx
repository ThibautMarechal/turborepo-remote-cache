import type { ActionFunction } from 'remix';
import { useLoaderData, type LoaderFunction } from 'remix';
import invariant from 'tiny-invariant';
import ListTitle from '~/component/ListTitle';
import Pagination from '~/component/Pagination';
import Table from '~/component/Table';
import { useArtifactsTable } from '~/hooks/table/useArtifactsTable';
import { usePaginateSearchParams } from '~/hooks/usePaginateSearchParams';
import { deleteArtifact, getArtifact, getArtifacts, getArtifactsCount } from '~/services/artifact.server';
import { requireCookieAuth } from '~/services/authentication.server';
import { CacheStorage } from '~/services/storage.server';
import { getPaginationFromRequest } from '~/utils/pagination';
import { getOrderByFromRequest } from '~/utils/sort';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const orderBy = getOrderByFromRequest(request);
  const { skip, take } = getPaginationFromRequest(request);
  const [artifacts, count] = await Promise.all([getArtifacts(skip, take, orderBy), getArtifactsCount()]);
  return {
    artifacts,
    count,
  };
};

export const action: ActionFunction = async ({ request, params, context }) => {
  await requireCookieAuth(request);
  const storage = new CacheStorage();
  const formData = await request.formData();
  const artifactId = formData.get('id');
  invariant(typeof artifactId === 'string', 'artifactId must be a string');
  const artifact = await getArtifact(artifactId);
  await Promise.all([storage.removeMeta(artifact), storage.removeArtifact(artifact), deleteArtifact(artifactId)]);
  return null;
};

export default function Artifacts() {
  const { artifacts, count } = useLoaderData<{ artifacts: Awaited<ReturnType<typeof getArtifacts>>; count: number }>();
  const tableProps = useArtifactsTable(artifacts);
  const paginationProps = usePaginateSearchParams();
  return (
    <>
      <ListTitle title="All Artifacts" count={count} />
      <Table {...tableProps} />
      <Pagination {...paginationProps} count={count} currentPageCount={artifacts.length} />
    </>
  );
}
