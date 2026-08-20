// OrganizersListTable.jsx

import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useSnackbar } from 'notistack';

import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeleteOrganizerMutation } from '../organizersApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import { toDisplayImageUrl } from '../../../shared-components/image-picker';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'organizers';

const COLUMNS = [
  {
    id: 'image',
    header: '',
    renderCell: (value, row) => {
      const nameText = typeof row.name === 'string' ? row.name : row.name?.en || row.name?.ar || '';
      const imageUrl = toDisplayImageUrl(value);

      return (
        <div className="flex items-center">
          {imageUrl ? (
            <img src={imageUrl} alt={nameText} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tedx-red text-sm font-semibold text-white">
              {nameText.charAt(0) || '?'}
            </div>
          )}
        </div>
      );
    },
    headerClassName: 'w-16',
  },

  {
    id: 'name',
    header: 'Name',
    sortable: true,
    renderCell: (value) => (
      <span className="font-medium text-tedx-dark">
        {typeof value === 'string' ? value : value?.en || value?.ar || '—'}
      </span>
    ),
  },

  {
    id: 'role',
    header: 'Role',
    sortable: true,
  },
];

function OrganizersListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const { canManage } = useOwnershipScope();

  const [deleteOrganizer, { isLoading: isDeleting }] = useDeleteOrganizerMutation();

  const [confirmItem, setConfirmItem] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!canManage(confirmItem)) {
      enqueueSnackbar('You can only delete records you created', { variant: 'warning' });
      setConfirmItem(null);
      return;
    }
    try {
      await deleteOrganizer(confirmItem._id).unwrap();

      enqueueSnackbar('Organizer deleted successfully', {
        variant: 'success',
      });

      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Failed to delete organizer', {
        variant: 'error',
      });
    }
  };

  const rowActions = (row) => {
    const actions = [
      {
        icon: <Visibility style={{ fontSize: 18 }} />,
        label: 'View',
        onClick: () => navigate(`/organizers/${row._id}`),
      },
    ];
    if (canManage(row)) {
      actions.push(
        {
          icon: <Edit style={{ fontSize: 18 }} />,
          label: 'Edit',
          onClick: () => navigate(`/organizers/${row.id}`),
        },
        {
          icon: <DeleteOutline style={{ fontSize: 18 }} />,
          label: 'Delete',
          danger: true,
          onClick: () => setConfirmItem(row),
        },
      );
    }
    return actions;
  };

  return (
    <>
      <CustomTable
        tableId={TABLE_ID}
        columns={COLUMNS}
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        rowActions={rowActions}
        emptyMessage="No organizers found"
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Organizer"
        description={`Are you sure you want to delete "${
          confirmItem?.name?.en || confirmItem?.name?.ar || 'this organizer'
        }"?`}
      />
    </>
  );
}

export default OrganizersListTable;
