import { useEffect, useMemo, useState } from 'react';
import { useTableState } from '../../../shared-components/custom-table';
import WallListHeader from './WallListHeader';
import WallListTable from './WallListTable';
import { useGetWallQuestionsQuery } from '../WallApi';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'wall';

function WallList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(
    () => withOwnerParams({ page: params.page, limit: params.pageSize }),
    [params.page, params.pageSize, withOwnerParams],
  );
  const { data, isLoading } = useGetWallQuestionsQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(filterOwned(data?.items ?? []));
  }, [data, filterOwned]);

  return (
    <div className="p-6 pt-8">
      <WallListHeader />
      <WallListTable
        data={filteredData}
        totalCount={filteredData.length || (data?.total ?? 0)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default WallList;
