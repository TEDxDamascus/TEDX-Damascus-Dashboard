import { useMemo } from 'react';
import { useGetOrganizersQuery } from '../organizersApi';
import { useTableState } from '../../../shared-components/custom-table';
import OrganizersListHeader from './organizersListHeader';
import OrganizersListTable from './organizersListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'organizers';
const FETCH_ALL_LIMIT = 1000;

function OrganizersList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();

  const queryArgs = useMemo(
    () =>
      withOwnerParams({
        page: 1,
        pageSize: FETCH_ALL_LIMIT,
        search: params.search,
      }),
    [params.search, withOwnerParams],
  );

  const { data, isLoading } = useGetOrganizersQuery(queryArgs);

  const allItems = useMemo(() => {
    const organizersArray = data?.data?.items ?? data?.data ?? [];
    return filterOwned(Array.isArray(organizersArray) ? organizersArray : []);
  }, [data, filterOwned]);

  const pageRows = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return allItems.slice(start, start + params.pageSize);
  }, [allItems, params.page, params.pageSize]);

  return (
    <div className="p-6 pt-8">
      <OrganizersListHeader />

      <OrganizersListTable data={pageRows} totalCount={allItems.length} isLoading={isLoading} />
    </div>
  );
}

export default OrganizersList;
