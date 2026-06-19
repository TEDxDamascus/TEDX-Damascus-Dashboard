import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeleteSpeakerMutation } from '../SpeakersApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';

const TABLE_ID = 'speakers';

const COLUMNS = [
  {
    id: 'speaker_image',
    header: '',
    renderCell: (value, row) => {
      const nameText = row.name?.en || row.name?.ar || '';
      return (
        <div className="flex items-center">
          {value ? (
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
    header: 'Name',
    sortable: true,
    renderCell: (value) => (
      <span className="font-medium text-tedx-dark">
        {typeof value === 'string' ? value : value?.en || value?.ar || '—'}
      </span>
    ),
  },
  {
    id: 'bio',
    header: 'Bio',
    renderCell: (value) => {
      const text = typeof value === 'string' ? value : value?.en || value?.ar || '';
      return (
        <span className="text-sm text-gray-500">
          {text.length > 60 ? `${text.slice(0, 60)}…` : text || '—'}
        </span>
      );
    },
  },
];

function SpeakersListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteSpeaker, { isLoading: isDeleting }] = useDeleteSpeakerMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDeleteConfirm = async () => {
    try {
      await deleteSpeaker(confirmItem.id).unwrap();
      enqueueSnackbar('Speaker deleted successfully', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Failed to delete speaker', { variant: 'error' });
    }
  };

  const rowActions = (row) => [
    {
      icon: <Visibility style={{ fontSize: 18 }} />,
      label: 'View',
      onClick: () => navigate(`/speakers/${row.id}`),
    },
    {
      icon: <Edit style={{ fontSize: 18 }} />,
      label: 'Edit',
      onClick: () => navigate(`/speakers/${row.id}`),
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
        emptyMessage="No speakers found. Add your first speaker!"
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Speaker"
        description={`Are you sure you want to delete "${confirmItem?.name?.en || confirmItem?.name?.ar || 'this speaker'}"? This action cannot be undone.`}
      />
    </>
  );
}

export default SpeakersListTable;
