import { useMemo } from 'react';
import { useGetFormsQuery } from '../FormsApi';
import { useTableState } from '../../../shared-components/custom-table';
import FormsListHeader from './FormsListHeader';
import FormsListTable from './FormsListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'forms';

function FormsList() {
  const { params } = useTableState(TABLE_ID);
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams({}), [withOwnerParams]);
  const { data, isLoading } = useGetFormsQuery(queryArgs, { refetchOnMountOrArgChange: true });

  const allForms = useMemo(() => {
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return filterOwned(items);
  }, [data, filterOwned]);

  const filtered = useMemo(() => {
    if (!params.search?.trim()) return allForms;
    const q = params.search.toLowerCase();
    return allForms.filter(
      (f) =>
        f.name?.en?.toLowerCase().includes(q) ||
        f.name?.ar?.toLowerCase().includes(q) ||
        f.targetRole?.toLowerCase().includes(q),
    );
  }, [allForms, params.search]);

  const pageRows = useMemo(() => {
    const start = (params.page - 1) * params.pageSize;
    return filtered.slice(start, start + params.pageSize);
  }, [filtered, params.page, params.pageSize]);

  return (
    <div className="p-6 pt-8">
      <FormsListHeader />
      <FormsListTable data={pageRows} totalCount={filtered.length} isLoading={isLoading} />
    </div>
  );
}

export default FormsList;
