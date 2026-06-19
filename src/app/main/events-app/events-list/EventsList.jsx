import { useState, useEffect } from 'react';
import { useTableState } from '../../../shared-components/custom-table';
import EventsListHeader from './EventsListHeader';
import EventsListTable from './EventsListTable';
import { useGetEventsQuery } from '../EventsApi';

const TABLE_ID = 'events';

function EventsList() {
  const { params } = useTableState(TABLE_ID);
  const { data, isLoading } = useGetEventsQuery(params, { refetchOnMountOrArgChange: true });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(data?.items ?? []);
  }, [data]);

  return (
    <div className="p-6 pt-8">
      <EventsListHeader />

      <EventsListTable data={filteredData} totalCount={data?.total ?? 0} isLoading={isLoading} />
    </div>
  );
}

export default EventsList;
