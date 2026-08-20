import { useState, useEffect, useMemo } from 'react';
import { useGetPartnersQuery } from '../PartnersApi'; // تأكدي من تعريف هذا الـ Hook في ملف Api
import { useTableState } from '../../../shared-components/custom-table';
import PartnersListHeader from './PartnersListHeader';
import PartnersListTable from './PartnersListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'partners';

function PartnersList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams(params), [params, withOwnerParams]);
  const { data, isLoading } = useGetPartnersQuery(queryArgs);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const partnersArray = data?.data?.items ?? data?.data ?? [];
    setFilteredData(filterOwned(Array.isArray(partnersArray) ? partnersArray : []));
  }, [data, filterOwned]);

  return (
    <div className="p-6 pt-8">
      <PartnersListHeader />

      <PartnersListTable
        data={filteredData}
        totalCount={filteredData.length || (data?.data?.total ?? data?.total ?? 0)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default PartnersList;
