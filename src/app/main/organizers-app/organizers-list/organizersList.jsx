import { useState, useEffect, useMemo } from 'react';

import { useGetOrganizersQuery } from '../organizersApi';

import { useTableState } from '../../../shared-components/custom-table';

import OrganizersListHeader from './organizersListHeader';
import OrganizersListTable from './organizersListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'organizers';

function OrganizersList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams(params), [params, withOwnerParams]);

  const { data, isLoading } = useGetOrganizersQuery(queryArgs);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const organizersArray = data?.data?.items ?? data?.data ?? [];

    setFilteredData(filterOwned(Array.isArray(organizersArray) ? organizersArray : []));
  }, [data, filterOwned]);

  return (
    <div className="p-6 pt-8">
      <OrganizersListHeader />

      <OrganizersListTable
        data={filteredData}
        totalCount={filteredData.length || (data?.data?.total ?? data?.total ?? 0)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default OrganizersList;
