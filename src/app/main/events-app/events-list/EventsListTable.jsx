import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeleteEventMutation } from '../EventsApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';
import { toDisplayImageUrl } from '../../../shared-components/image-picker';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'events';

function getLocalizedText(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value.en || value.ar || '';
  return '';
}

const COLUMNS = [
  {
    id: 'image',
    header: '',
    renderCell: (value, row) => (
      <div className="flex items-center">
        {toDisplayImageUrl(value) ? (
          <img src={toDisplayImageUrl(value)} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
            {getLocalizedText(row.title).charAt(0) || '?'}
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'title',
    header: 'Event Title',
    renderCell: (value) => getLocalizedText(value) || '—',
  },
  { id: 'date', header: 'Date' },
  {
    id: 'location',
    header: 'Location',
    renderCell: (value) => getLocalizedText(value) || '—',
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
  const { canManage } = useOwnershipScope();
  const [deleteEvent] = useDeleteEventMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDelete = async () => {
    if (!canManage(confirmItem)) {
      enqueueSnackbar('You can only delete records you created', { variant: 'warning' });
      setConfirmItem(null);
      return;
    }
    try {
      await deleteEvent(confirmItem.id).unwrap();
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  const actions = (row) => {
    const rowActions = [
      {
        icon: <Visibility />,
        onClick: () => navigate(`/events/${row.id}`),
      },
    ];
    if (canManage(row)) {
      rowActions.push(
        {
          icon: <Edit />,
          onClick: () => navigate(`/events/${row.id}?mode=edit`),
        },
        {
          icon: <DeleteOutline />,
          danger: true,
          onClick: () => setConfirmItem(row),
        },
      );
    }
    return rowActions;
  };

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
