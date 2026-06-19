import { useState, useEffect } from 'react';
import { useGetPartnersQuery } from '../PartnersApi'; // تأكدي من تعريف هذا الـ Hook في ملف Api
import { useTableState } from '../../../shared-components/custom-table';
import PartnersListHeader from './PartnersListHeader';
import PartnersListTable from './PartnersListTable';

const TABLE_ID = 'partners';

function PartnersList() {
  const { params } = useTableState(TABLE_ID);
  const { data, isLoading } = useGetPartnersQuery(params);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const partnersArray = data?.data?.items ?? data?.data ?? [];
    setFilteredData(partnersArray);
  }, [data]);

  return (
    <div className="p-6 pt-8">
      <PartnersListHeader />

      <PartnersListTable
        data={filteredData}
        totalCount={data?.data?.total ?? data?.total ?? 0}
        isLoading={isLoading}
      />
    </div>
  );
}

export default PartnersList;
