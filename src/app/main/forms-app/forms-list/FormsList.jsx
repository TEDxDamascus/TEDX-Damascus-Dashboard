import { useMemo, useState } from 'react';
import { useGetFormsQuery } from '../FormsApi';
import FormsListHeader from './FormsListHeader';
import FormsListTable from './FormsListTable';

const PAGE_SIZE = 10;

function FormsList() {
  const { data, isLoading } = useGetFormsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [page, _setPage] = useState(1);
  const [search, _setSearch] = useState('');

  const allForms = useMemo(
    () => (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []),
    [data],
  );

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
