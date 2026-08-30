import { useMemo } from 'react';
import { useGetPartnersQuery } from '../PartnersApi';
import { useTableState } from '../../../shared-components/custom-table';
import PartnersListHeader from './PartnersListHeader';
import PartnersListTable from './PartnersListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'partners';
const FETCH_ALL_LIMIT = 1000;

function PartnersList() {
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
  const { data, isLoading } = useGetPartnersQuery(queryArgs);

  const allItems = useMemo(() => {
    const partnersArray = data?.data?.items ?? data?.data ?? [];
    return filterOwned(Array.isArray(partnersArray) ? partnersArray : []);
  }, [data, filterOwned]);

  const pageRows = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return allItems.slice(start, start + params.pageSize);
  }, [allItems, params.page, params.pageSize]);

  return (
    <div className="p-6 pt-8">
      <PartnersListHeader />

      <PartnersListTable data={pageRows} totalCount={allItems.length} isLoading={isLoading} />
    </div>
  );
}

export default PartnersList;
