import { useState, useEffect, useMemo } from 'react';
import { useGetSpeakersQuery } from '../SpeakersApi';
import { useTableState } from '../../../shared-components/custom-table';
import SpeakersListHeader from './SpeakersListHeader';
import SpeakersListTable from './SpeakersListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'speakers';

function SpeakersList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams(params), [params, withOwnerParams]);
  const { data, isLoading } = useGetSpeakersQuery(queryArgs);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const speakersArray = data?.data?.items ?? data?.data ?? [];
    setFilteredData(filterOwned(Array.isArray(speakersArray) ? speakersArray : []));
  }, [data, filterOwned]);

  return (
    <div className="p-6 pt-8">
      <SpeakersListHeader />

      <SpeakersListTable
        data={filteredData}
        totalCount={filteredData.length || (data?.data?.total ?? data?.total ?? 0)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default SpeakersList;
