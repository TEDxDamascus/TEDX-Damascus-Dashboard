import { useState, useEffect } from 'react';
import { useGetSpeakersQuery } from '../SpeakersApi';
import { useTableState } from '../../../shared-components/custom-table';
import SpeakersListHeader from './SpeakersListHeader';
import SpeakersListTable from './SpeakersListTable';

const TABLE_ID = 'speakers';

function SpeakersList() {
  const { params } = useTableState(TABLE_ID);
  const { data, isLoading } = useGetSpeakersQuery(params);

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const speakersArray = data?.data?.items ?? data?.data ?? [];
    setFilteredData(speakersArray);
  }, [data]);

  return (
    <div className="p-6 pt-8">
      <SpeakersListHeader />

      <SpeakersListTable
        data={filteredData}
        totalCount={data?.data?.total ?? data?.total ?? 0}
        isLoading={isLoading}
      />
    </div>
  );
}

export default SpeakersList;
