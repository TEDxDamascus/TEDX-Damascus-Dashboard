import { useState, useEffect } from 'react';
import { useGetUsersQuery } from '../UsersApi';
import { useTableState } from '../../../shared-components/custom-table';
import UsersListHeader from './UsersListHeader';
import UsersListTable from './UsersListTable';

const TABLE_ID = 'users';

function UsersList() {
  const { params } = useTableState(TABLE_ID);
  const { data, isLoading } = useGetUsersQuery(params);

  const [filteredData, setFilteredData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const usersArray = data?.data ?? [];
    setFilteredData(usersArray);
  }, [data]);

  const handleSelectChange = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleBulkAction = () => {
    setSelectedIds([]);
  };

  return (
    <div className="p-6 pt-8">
      <UsersListHeader />

      <UsersListTable
        data={filteredData}
        totalCount={data?.data?.total ?? 0}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectChange}
        onBulkAction={handleBulkAction}
      />
    </div>
  );
}

export default UsersList;
