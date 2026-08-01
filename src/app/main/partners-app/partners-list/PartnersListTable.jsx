import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';

import { useDeletePartnerMutation } from '../PartnersApi';

import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';

const TABLE_ID = 'partners';

const getDisplayName = (name) => {
  if (!name) return '—';

  if (typeof name === 'string') {
    return name;
  }

  return name.en || name.ar || '—';
};

const COLUMNS = [
  {
    id: 'image',
    header: '',

    renderCell: (value, row) => {
      const nameText = getDisplayName(row.name);

      const imageUrl = typeof value === 'string' ? value : value?.url || '';

      return (
        <div className="flex items-center">
          {imageUrl ? (
            <img src={imageUrl} alt={nameText} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tedx-red text-sm font-semibold text-white">
              {nameText.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      );
    },

    headerClassName: 'w-16',
  },

  {
    id: 'name',

    header: 'Partner Name',

    sortable: true,

    renderCell: (value) => (
      <span className="font-medium text-tedx-dark">{getDisplayName(value)}</span>
    ),
  },

  {
    id: 'partner_ship_type',

    header: 'Type',

    sortable: true,

    renderCell: (value) => (
      <span className="w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {value || '—'}
      </span>
    ),
  },

  {
    id: 'slug',

    header: 'Slug',

    renderCell: (value) => <span className="text-sm text-gray-500">{getDisplayName(value)}</span>,
  },
];

function PartnersListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [deletePartner, { isLoading: isDeleting }] = useDeletePartnerMutation();

  const [confirmItem, setConfirmItem] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!confirmItem) return;

    const id = confirmItem.id || confirmItem._id;

    if (!id) {
      enqueueSnackbar('Partner id not found', {
        variant: 'error',
      });

      return;
    }

    try {
      await deletePartner(id).unwrap();

      enqueueSnackbar('Partner deleted successfully', {
        variant: 'success',
      });

      setConfirmItem(null);
    } catch (error) {
      console.error('Delete partner failed:', error);

      enqueueSnackbar('Failed to delete partner', {
        variant: 'error',
      });
    }
  };

  const rowActions = (row) => [
    {
      icon: <Visibility style={{ fontSize: 18 }} />,

      label: 'View',

      onClick: () => navigate(`/partners/${row.id || row._id}`),
    },

    {
      icon: <Edit style={{ fontSize: 18 }} />,

      label: 'Edit',

      onClick: () => navigate(`/partners/${row.id || row._id}`),
    },

    {
      icon: <DeleteOutline style={{ fontSize: 18 }} />,

      label: 'Delete',

      danger: true,

      onClick: () => setConfirmItem(row),
    },
  ];

  return (
    <>
      <CustomTable
        tableId={TABLE_ID}
        columns={COLUMNS}
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        rowActions={rowActions}
        emptyMessage="No partners found. Add your first partner!"
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Partner"
        description={`
Are you sure you want to delete 
"${getDisplayName(confirmItem?.name)}"?
This action cannot be undone.
`}
      />
    </>
  );
}

export default PartnersListTable;
