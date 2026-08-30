import { useMemo } from 'react';
import { useGetTeamQuery } from '../teamApi';
import { useTableState } from '../../../shared-components/custom-table';
import TeamListHeader from './TeamListHeader';
import TeamListTable from './TeamListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'team_members';
const FETCH_ALL_LIMIT = 1000;

function TeamList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();

  // /team respects `limit` but does not return a reliable `total`, so fetch the
  // full list once and paginate on the client.
  const queryArgs = useMemo(
    () =>
      withOwnerParams({
        page: 1,
        pageSize: FETCH_ALL_LIMIT,
        search: params.search,
      }),
    [params.search, withOwnerParams],
  );

  const { data, isLoading } = useGetTeamQuery(queryArgs);

  const allItems = useMemo(() => {
    const teamArray = data?.data?.items ?? data?.data ?? [];
    return filterOwned(Array.isArray(teamArray) ? teamArray : []);
  }, [data, filterOwned]);

  const pageRows = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return allItems.slice(start, start + params.pageSize);
  }, [allItems, params.page, params.pageSize]);

  return (
    <div className="p-6 pt-8">
      <TeamListHeader />

      <TeamListTable data={pageRows} totalCount={allItems.length} isLoading={isLoading} />
    </div>
  );
}

export default TeamList;
