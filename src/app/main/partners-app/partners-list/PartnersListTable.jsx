import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeletePartnerMutation } from '../PartnersApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';

const TABLE_ID = 'partners';

const COLUMNS = [
  {
    id: 'image',
    header: '',
    renderCell: (value, row) => {
      const nameText = typeof row.name === 'string' ? row.name : row.name?.en || row.name?.ar || '';
      const isUrl = typeof value === 'string' && value.startsWith('http');
      return (
        <div className="flex items-center">
          {isUrl ? (
            <img src={value} alt={nameText} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tedx-red text-sm font-semibold text-white">
              {nameText.charAt(0).toUpperCase() || '?'}
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
      <span className="font-medium text-tedx-dark">
        {typeof value === 'string' ? value : value?.en || value?.ar || '—'}
      </span>
    ),
  },
  {
    id: 'partnership_type',
    header: 'Type',
    sortable: true,
    renderCell: (value) => (
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {value || '—'}
      </span>
    ),
  },
  {
    id: 'slug',
    header: 'Slug',
    renderCell: (value) => (
      <span className="text-sm text-gray-500">
        {typeof value === 'string' ? value : value?.en || value?.ar || '—'}
      </span>
    ),
  },
];

function PartnersListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deletePartner, { isLoading: isDeleting }] = useDeletePartnerMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDeleteConfirm = async () => {
    try {
      await deletePartner(confirmItem.id).unwrap();
      enqueueSnackbar('Partner deleted successfully', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Failed to delete partner', { variant: 'error' });
    }
  };

  const rowActions = (row) => [
    {
      icon: <Visibility style={{ fontSize: 18 }} />,
      label: 'View',
      onClick: () => navigate(`/partners/${row.id}`),
    },
    {
      icon: <Edit style={{ fontSize: 18 }} />,
      label: 'Edit',
      onClick: () => navigate(`/partners/${row.id}`),
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
        description={`Are you sure you want to delete "${confirmItem?.name?.en || confirmItem?.name?.ar || 'this partner'}"? This action cannot be undone.`}
      />
    </>
  );
}

export default PartnersListTable;
