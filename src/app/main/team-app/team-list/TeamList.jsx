import { useState, useEffect } from 'react';
import { useGetTeamQuery } from '../teamApi';
import { useTableState } from '../../../shared-components/custom-table';
import TeamListHeader from './TeamListHeader';
import TeamListTable from './TeamListTable';

const TABLE_ID = 'team_members';

function TeamList() {
  const { params } = useTableState(TABLE_ID);

  const { data, isLoading } = useGetTeamQuery(params);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const teamArray = data?.data?.items ?? data?.data ?? [];
    setFilteredData(teamArray);
  }, [data]);

  return (
    <div className="p-6 pt-8">
      <TeamListHeader />

      <TeamListTable
        data={filteredData}
        totalCount={data?.data?.total ?? data?.total ?? 0}
        isLoading={isLoading}
      />
    </div>
  );
}

export default TeamList;
