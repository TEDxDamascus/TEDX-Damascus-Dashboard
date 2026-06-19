import { useEffect, useState } from 'react';
import { useTableState } from '../../../shared-components/custom-table';
import WallListHeader from './WallListHeader';
import WallListTable from './WallListTable';
import { useGetWallQuestionsQuery } from '../WallApi';

const TABLE_ID = 'wall';

function WallList() {
  const { params } = useTableState(TABLE_ID);
  const { data, isLoading } = useGetWallQuestionsQuery(
    { page: params.page, limit: params.pageSize },
    { refetchOnMountOrArgChange: true },
  );

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(data?.items ?? []);
  }, [data]);

  return (
    <div className="p-6 pt-8">
      <WallListHeader />
      <WallListTable data={filteredData} totalCount={data?.total ?? 0} isLoading={isLoading} />
    </div>
  );
}

export default WallList;
