import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeleteEventMutation } from '../EventsApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';

const TABLE_ID = 'events';

const COLUMNS = [
  {
    id: 'image',
    header: '',
    renderCell: (value, row) => {
      const titleText = typeof row.title === 'string' ? row.title : row.title?.en || row.title?.ar || '';
      return (
        <div className="flex items-center">
          {value ? (
            <img src={value} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
              {titleText.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: 'title',
    header: 'Event Title',
    renderCell: (value) => (
      <span className="font-medium text-tedx-dark">
        {typeof value === 'string' ? value : value?.en || value?.ar || '—'}
      </span>
    ),
  },
  { id: 'date', header: 'Date' },
  {
    id: 'location',
    header: 'Location',
    renderCell: (value) => (
      <span>{typeof value === 'string' ? value : value?.en || value?.ar || '—'}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    renderCell: (v) => <StatusBadge status={v} />,
  },
];

function EventsListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteEvent] = useDeleteEventMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDelete = async () => {
    try {
      await deleteEvent(confirmItem.id).unwrap();
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  const actions = (row) => [
    {
      icon: <Visibility />,
      onClick: () => navigate(`/events/${row.id}`),
    },
    {
      icon: <Edit />,
      onClick: () => navigate(`/events/${row.id}?mode=edit`),
    },
    {
      icon: <DeleteOutline />,
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
        rowActions={actions}
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDelete}
        title="Delete Event"
      />
    </>
  );
}

export default EventsListTable;
