import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, Block, CheckCircle, Delete, Security } from '@mui/icons-material';
import { Checkbox, Chip } from '@mui/material';
import {
  useEnableUserMutation,
  useDisableUserMutation,
  useDeleteUserMutation,
  useBulkEnableUsersMutation,
  useBulkDisableUsersMutation,
} from '../UsersApi';
import { selectUser } from '../../../auth/store/userSlice';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';
import PermissionsDialog from '../components/PermissionsDialog';

const TABLE_ID = 'users';

const COLUMNS = [
  {
    id: 'select',
    header: '',
    renderCell: (value, row, { selectedIds, onSelectChange }) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={(e) => {
          const checked = e.target.checked;
          onSelectChange((prev) =>
            checked ? [...prev, row.id] : prev.filter((x) => x !== row.id),
          );
        }}
      />
    ),
    headerClassName: 'w-12',
    sortable: false,
  },
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    renderCell: (value) => <span className="font-medium text-tedx-dark">{value || '—'}</span>,
  },
  { id: 'email', header: 'Email', sortable: true },
  {
    id: 'role',
    header: 'Role',
    sortable: true,
    renderCell: (value, row) => {
      const role = value || row.role || 'user';
      const isAdmin = role === 'admin' || role === 'superadmin';
      return (
        <Chip
          label={isAdmin ? 'Admin' : 'User'}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: isAdmin ? '#FFF3E0' : '#E3F2FD',
            color: isAdmin ? '#E65100' : '#1565C0',
          }}
        />
      );
    },
  },
  {
    id: 'isActive',
    header: 'Status',
    renderCell: (value, row) => (
      <StatusBadge status={(value ?? row.isActive) ? 'active' : 'inactive'} />
    ),
  },
];

function UsersListTable({
  data,
  totalCount,
  isLoading,
  selectedIds,
  onSelectChange,
  onBulkAction,
  roleTab,
}) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useSelector(selectUser);
  const [enableUser, { isLoading: isEnabling }] = useEnableUserMutation();
  const [disableUser, { isLoading: isDisabling }] = useDisableUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [bulkEnableUsers, { isLoading: isBulkEnabling }] = useBulkEnableUsersMutation();
  const [bulkDisableUsers, { isLoading: isBulkDisabling }] = useBulkDisableUsersMutation();

  const [confirmDisable, setConfirmDisable] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [permissionsUser, setPermissionsUser] = useState(null);

  const isBusy = isEnabling || isDisabling || isDeleting || isBulkEnabling || isBulkDisabling;

  const handleEnable = async (user) => {
    try {
      await enableUser(user.id).unwrap();
      enqueueSnackbar('User enabled successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to enable user', { variant: 'error' });
    }
  };

  const handleDisable = async (user) => {
    if (user.id === currentUser?.id) {
      enqueueSnackbar('You cannot disable your own account', { variant: 'warning' });
      return;
    }
    try {
      await disableUser(user.id).unwrap();
      enqueueSnackbar('User disabled successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to disable user', { variant: 'error' });
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      enqueueSnackbar('You cannot delete your own account', { variant: 'warning' });
      return;
    }
    try {
      await deleteUser(user.id).unwrap();
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
  };

  const handleBulkEnable = async () => {
    try {
      await bulkEnableUsers({ ids: selectedIds }).unwrap();
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
      await bulkDisableUsers({ ids: selectedIds }).unwrap();
      enqueueSnackbar(`${selectedIds.length} users disabled successfully`, { variant: 'success' });
      onBulkAction();
    } catch {
      enqueueSnackbar('Failed to disable users', { variant: 'error' });
    }
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

    if (row.role === 'admin' || row.role === 'superadmin') {
      actions.push({
        icon: <Security style={{ fontSize: 18 }} />,
        label: 'Permissions',
        onClick: () => setPermissionsUser(row),
      });
    }

    if (row.id !== currentUser?.id) {
      actions.push({
        icon: row.isActive ? (
          <Block style={{ fontSize: 18 }} />
        ) : (
          <CheckCircle style={{ fontSize: 18 }} />
        ),
        label: row.isActive ? 'Disable' : 'Enable',
        onClick: () => {
          if (row.isActive) setConfirmDisable(row);
          else handleEnable(row);
        },
      });
      actions.push({
        icon: <Delete style={{ fontSize: 18 }} />,
        label: 'Delete',
        onClick: () => setConfirmDelete(row),
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
            disabled: isBusy,
          },
          {
            label: 'Disable Selected',
            onClick: handleBulkDisable,
            disabled: isBusy,
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
        emptyMessage={
          roleTab === 'admin'
            ? 'No admins found. Add your first admin!'
            : 'No users found. Add your first user!'
        }
      />

      <ConfirmModal
        open={!!confirmDisable}
        onClose={() => setConfirmDisable(null)}
        onConfirm={async () => {
          await handleDisable(confirmDisable);
          setConfirmDisable(null);
        }}
        loading={isDisabling}
        title="Disable User"
        description={`Are you sure you want to disable ${confirmDisable?.name || confirmDisable?.email}? They will lose access to the system.`}
        confirmLabel="Disable"
        variant="warning"
      />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await handleDelete(confirmDelete);
          setConfirmDelete(null);
        }}
        loading={isDeleting}
        title="Delete User"
        description={`Are you sure you want to permanently delete ${confirmDelete?.name || confirmDelete?.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <PermissionsDialog
        open={!!permissionsUser}
        user={permissionsUser}
        onClose={() => setPermissionsUser(null)}
      />
    </>
  );
}

export default UsersListTable;
