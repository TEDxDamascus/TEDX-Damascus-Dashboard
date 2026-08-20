import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetUsersQuery } from '../UsersApi';
import { useTableState } from '../../../shared-components/custom-table';
import UsersListHeader from './UsersListHeader';
import UsersListTable from './UsersListTable';

const TABLE_ID = 'users';

function UsersList() {
  const { params } = useTableState(TABLE_ID);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [roleTab, setRoleTab] = useState(tabParam === 'user' ? 'user' : 'admin');
  const { data, isLoading } = useGetUsersQuery({ ...params, role: roleTab });

  const [filteredData, setFilteredData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (tabParam === 'user' || tabParam === 'admin') {
      setRoleTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    setFilteredData(data?.items ?? []);
    setSelectedIds([]);
  }, [data, roleTab]);

  const handleRoleTabChange = (value) => {
    setRoleTab(value);
    setSearchParams(value === 'admin' ? {} : { tab: value });
  };

  const handleSelectChange = (idsOrFn) => {
    setSelectedIds((prev) => (typeof idsOrFn === 'function' ? idsOrFn(prev) : idsOrFn));
  };

  const handleBulkAction = () => {
    setSelectedIds([]);
  };

  return (
    <div className="p-6 pt-8">
      <UsersListHeader roleTab={roleTab} onRoleTabChange={handleRoleTabChange} />

      <UsersListTable
        data={filteredData}
        totalCount={data?.total ?? 0}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={handleSelectChange}
        onBulkAction={handleBulkAction}
        roleTab={roleTab}
      />
    </div>
  );
}

export default UsersList;
