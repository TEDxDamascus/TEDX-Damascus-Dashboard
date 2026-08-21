import { useState, useEffect, useMemo } from 'react';
import { useGetTeamQuery } from '../teamApi';
import { useTableState } from '../../../shared-components/custom-table';
import TeamListHeader from './TeamListHeader';
import TeamListTable from './TeamListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'team_members';

function TeamList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams(params), [params, withOwnerParams]);

  const { data, isLoading } = useGetTeamQuery(queryArgs);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const teamArray = data?.data?.items ?? data?.data ?? [];
    setFilteredData(filterOwned(Array.isArray(teamArray) ? teamArray : []));
  }, [data, filterOwned]);

  return (
    <div className="p-6 pt-8">
      <TeamListHeader />

      <TeamListTable
        data={filteredData}
        totalCount={filteredData.length || (data?.data?.total ?? data?.total ?? 0)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default TeamList;
