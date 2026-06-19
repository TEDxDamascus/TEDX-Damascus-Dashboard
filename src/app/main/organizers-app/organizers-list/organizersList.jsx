import { useState, useEffect } from 'react';

import { useGetOrganizersQuery } from '../organizersApi';

import { useTableState } from '../../../shared-components/custom-table';

import OrganizersListHeader from './organizersListHeader';
import OrganizersListTable from './organizersListTable';

const TABLE_ID = 'organizers';

function OrganizersList() {
  const { params } = useTableState(TABLE_ID);

  const { data, isLoading } = useGetOrganizersQuery(params);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const organizersArray = data?.data?.items ?? data?.data ?? [];

    setFilteredData(organizersArray);
  }, [data]);

  return (
    <div className="p-6 pt-8">
      <OrganizersListHeader />

      <OrganizersListTable
        data={filteredData}
        totalCount={data?.data?.total ?? data?.total ?? 0}
        isLoading={isLoading}
      />
    </div>
  );
}

export default OrganizersList;
