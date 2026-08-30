import { useMemo } from 'react';
import { useTableState } from '../../../shared-components/custom-table';
import WallListHeader from './WallListHeader';
import WallListTable from './WallListTable';
import { useGetWallQuestionsQuery } from '../WallApi';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'wall';
const FETCH_ALL_LIMIT = 1000;

function WallList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();

  const queryArgs = useMemo(
    () =>
      withOwnerParams({
        page: 1,
        limit: FETCH_ALL_LIMIT,
      }),
    [withOwnerParams],
  );
  const { data, isLoading } = useGetWallQuestionsQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  const allItems = useMemo(() => filterOwned(data?.items ?? []), [data, filterOwned]);

  const pageRows = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return allItems.slice(start, start + params.pageSize);
  }, [allItems, params.page, params.pageSize]);

  return (
    <div className="p-6 pt-8">
      <WallListHeader />
      <WallListTable data={pageRows} totalCount={allItems.length} isLoading={isLoading} />
    </div>
  );
}

export default WallList;
