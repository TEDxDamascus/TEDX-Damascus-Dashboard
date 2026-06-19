import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, Block, CheckCircle } from '@mui/icons-material';
import { Checkbox } from '@mui/material';
import { useUpdateUserMutation, useBulkUpdateUsersMutation } from '../UsersApi';
import { selectUser } from '../../../auth/store/userSlice';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';

const TABLE_ID = 'users';

const COLUMNS = [
  {
    id: 'select',
    header: '',
    renderCell: (value, row, { selectedIds, onSelectChange }) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={(e) => onSelectChange(row.id, e.target.checked)}
      />
    ),
    headerClassName: 'w-12',
    sortable: false,
  },
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    renderCell: (value) => <span className="font-medium text-tedx-dark">{value}</span>,
  },
  { id: 'email', header: 'Email', sortable: true },
  { id: 'role', header: 'Role', sortable: true },
  {
    id: 'status',
    header: 'Status',
    renderCell: (value) => <StatusBadge status={value === 'active' ? 'active' : 'inactive'} />,
  },
];

function UsersListTable({
  data,
  totalCount,
  isLoading,
  selectedIds,
  onSelectChange,
  onBulkAction,
}) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useSelector(selectUser);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [bulkUpdateUsers, { isLoading: isBulkUpdating }] = useBulkUpdateUsersMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleToggleStatus = async (user) => {
    // Safety check: prevent disabling own account
    if (user.status === 'active' && user.id === currentUser?.id) {
      enqueueSnackbar('You cannot disable your own account', { variant: 'warning' });
      return;
    }
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active';
      await updateUser({ id: user.id, data: { status: newStatus } }).unwrap();
      enqueueSnackbar(`User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`, {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    }
  };

  const handleBulkEnable = async () => {
    try {
      await bulkUpdateUsers({ ids: selectedIds, data: { status: 'active' } }).unwrap();
      enqueueSnackbar(`${selectedIds.length} users enabled successfully`, { variant: 'success' });
      onBulkAction();
    } catch {
      enqueueSnackbar('Failed to enable users', { variant: 'error' });
    }
  };

  const handleBulkDisable = async () => {
    if (selectedIds.includes(currentUser?.id)) {
      enqueueSnackbar('You cannot disable your own account', { variant: 'warning' });
      return;
    }
    try {
      await bulkUpdateUsers({ ids: selectedIds, data: { status: 'disabled' } }).unwrap();
      enqueueSnackbar(`${selectedIds.length} users disabled successfully`, { variant: 'success' });
      onBulkAction();
    } catch {
      enqueueSnackbar('Failed to disable users', { variant: 'error' });
    }
  };

  const handleDisableConfirm = async () => {
    await handleToggleStatus(confirmItem);
    setConfirmItem(null);
  };

  const rowActions = (row) => {
    const actions = [
      {
        icon: <Visibility style={{ fontSize: 18 }} />,
        label: 'View',
        onClick: () => navigate(`/users/${row.id}`),
      },
      {
        icon: <Edit style={{ fontSize: 18 }} />,
        label: 'Edit',
        onClick: () => navigate(`/users/${row.id}`),
      },
    ];

    if (row.id !== currentUser?.id) {
      actions.push({
        icon:
          row.status === 'active' ? (
            <Block style={{ fontSize: 18 }} />
          ) : (
            <CheckCircle style={{ fontSize: 18 }} />
          ),
        label: row.status === 'active' ? 'Disable' : 'Enable',
        onClick: () => {
          if (row.status === 'active') {
            setConfirmItem(row);
          } else {
            handleToggleStatus(row);
          }
        },
      });
    } else {
      actions.push({
        icon: <Block style={{ fontSize: 18, color: 'gray' }} />,
        label: 'Disable',
        disabled: true,
        title: 'You cannot disable your own account',
      });
    }

    return actions;
  };

  const bulkActions =
    selectedIds.length > 0
      ? [
          {
            label: 'Enable Selected',
            onClick: handleBulkEnable,
            disabled: isBulkUpdating,
          },
          {
            label: 'Disable Selected',
            onClick: handleBulkDisable,
            disabled: isBulkUpdating,
          },
        ]
      : [];

  return (
    <>
      <CustomTable
        tableId={TABLE_ID}
        columns={COLUMNS}
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectChange={onSelectChange}
        emptyMessage="No users found. Add your first user!"
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDisableConfirm}
        loading={isUpdating}
        title="Disable User"
        description={`Are you sure you want to disable ${confirmItem?.name}? They will lose access to the system.`}
        confirmLabel="Disable"
        variant="warning"
      />
    </>
  );
}

export default UsersListTable;
