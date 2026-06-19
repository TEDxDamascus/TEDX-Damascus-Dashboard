import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, DeleteOutline } from '@mui/icons-material';
import { useDeleteWallQuestionMutation } from '../WallApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';

const TABLE_ID = 'wall';

const COLUMNS = [
  {
    id: 'title',
    header: 'Question',
    renderCell: (v) => (
      <span className="font-medium text-gray-900">
        {v?.en || v?.ar || <span className="italic text-gray-400">Untitled</span>}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    renderCell: (v) => <StatusBadge status={v} />,
  },
  {
    id: 'answersCount',
    header: 'Answers',
    sortable: true,
    renderCell: (v) => (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {v ?? 0}
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Created',
    sortable: true,
    renderCell: (v) =>
      v ? <span className="text-gray-500">{new Date(v).toLocaleDateString()}</span> : '—',
  },
];

function WallListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteQuestion] = useDeleteWallQuestionMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDelete = async () => {
    try {
      await deleteQuestion(confirmItem.id).unwrap();
      enqueueSnackbar('Question deleted', { variant: 'success' });
      setConfirmItem(null);
    } catch {
      enqueueSnackbar('Delete failed', { variant: 'error' });
    }
  };

  const actions = (row) => [
    {
      icon: <Edit style={{ fontSize: 18 }} />,
      title: 'Edit & Answers',
      onClick: () => navigate(`/wall/${row.id}`),
    },
    {
      icon: <DeleteOutline style={{ fontSize: 18 }} />,
      title: 'Delete',
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
        emptyMessage="No wall questions yet. Add one to get started."
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        description={`Delete "${confirmItem?.title?.en || confirmItem?.title?.ar || 'this question'}" and all its answers? This cannot be undone.`}
      />
    </>
  );
}

export default WallListTable;
