import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeleteTeamMemberMutation } from '../teamApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import { toDisplayImageUrl } from '../../../shared-components/image-picker';

const TABLE_ID = 'team_members';

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
    id: 'year',
    header: 'Year',
    sortable: true,
    renderCell: (value) => (
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {value || '—'}
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

function TeamListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteMember, { isLoading: isDeleting }] = useDeleteTeamMemberMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDeleteConfirm = async () => {
    try {
      await deleteMember(confirmItem.id).unwrap();
      enqueueSnackbar('Member deleted successfully', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Failed to delete member', { variant: 'error' });
    }
  };

  const rowActions = (row) => [
    {
      icon: <Visibility style={{ fontSize: 18 }} />,
      label: 'View',
      onClick: () => navigate(`/team/${row.id}`),
    },
    {
      icon: <Edit style={{ fontSize: 18 }} />,
      label: 'Edit',
      onClick: () => navigate(`/team/${row.id}`),
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
        emptyMessage="No team members found."
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Team Member"
        description={`Are you sure you want to delete "${confirmItem?.name?.en || confirmItem?.name?.ar || 'this member'}"?`}
      />
    </>
  );
}

export default TeamListTable;
