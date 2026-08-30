import { useMemo } from 'react';
import { useGetSpeakersQuery } from '../SpeakersApi';
import { useTableState } from '../../../shared-components/custom-table';
import SpeakersListHeader from './SpeakersListHeader';
import SpeakersListTable from './SpeakersListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'speakers';
const FETCH_ALL_LIMIT = 1000;

function SpeakersList() {
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
  const { data, isLoading } = useGetSpeakersQuery(queryArgs);

  const allItems = useMemo(() => {
    const speakersArray = data?.data?.items ?? data?.data ?? [];
    return filterOwned(Array.isArray(speakersArray) ? speakersArray : []);
  }, [data, filterOwned]);

  const pageRows = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return allItems.slice(start, start + params.pageSize);
  }, [allItems, params.page, params.pageSize]);

  return (
    <div className="p-6 pt-8">
      <SpeakersListHeader />

      <SpeakersListTable data={pageRows} totalCount={allItems.length} isLoading={isLoading} />
    </div>
  );
}

export default SpeakersList;
