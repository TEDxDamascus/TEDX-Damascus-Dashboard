import { useState, useEffect, useMemo } from 'react';
import { useTableState } from '../../../shared-components/custom-table';
import EventsListHeader from './EventsListHeader';
import EventsListTable from './EventsListTable';
import { useGetEventsQuery } from '../EventsApi';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'events';

function EventsList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams(params), [params, withOwnerParams]);
  const { data, isLoading } = useGetEventsQuery(queryArgs, { refetchOnMountOrArgChange: true });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(filterOwned(data?.items ?? []));
  }, [data, filterOwned]);

  return (
    <div className="p-6 pt-8">
      <EventsListHeader />

      <EventsListTable
        data={filteredData}
        totalCount={filteredData.length || (data?.total ?? 0)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default EventsList;
