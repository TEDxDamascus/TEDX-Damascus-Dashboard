import { useMemo, useState } from 'react';
import { useGetFormsQuery } from '../FormsApi';
import FormsListHeader from './FormsListHeader';
import FormsListTable from './FormsListTable';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const PAGE_SIZE = 10;

function FormsList() {
  const { withOwnerParams, filterOwned } = useOwnershipScope();
  const queryArgs = useMemo(() => withOwnerParams({}), [withOwnerParams]);
  const { data, isLoading } = useGetFormsQuery(queryArgs, { refetchOnMountOrArgChange: true });
  const [page, _setPage] = useState(1);
  const [search, _setSearch] = useState('');

  const allForms = useMemo(() => {
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return filterOwned(items);
  }, [data, filterOwned]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allForms;
    const q = search.toLowerCase();
    return allForms.filter(
      (f) =>
        f.name?.en?.toLowerCase().includes(q) ||
        f.name?.ar?.toLowerCase().includes(q) ||
        f.targetRole?.toLowerCase().includes(q),
    );
  }, [allForms, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6 pt-8">
      <FormsListHeader />
      <FormsListTable data={paginated} totalCount={filtered.length} isLoading={isLoading} />
    </div>
  );
}

export default FormsList;
