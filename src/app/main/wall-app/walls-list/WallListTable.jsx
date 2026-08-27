import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Edit, Visibility, DeleteOutline } from '@mui/icons-material';
import { useDeleteWallQuestionMutation } from '../WallApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'wall';

function localeText(v) {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') return v.en || v.ar || '';
  return '';
}

const COLUMNS = [
  {
    id: 'text',
    header: 'Question',
    renderCell: (v) => {
      const text = localeText(v);
      return (
        <span className="font-medium text-gray-900">
          {text || <span className="italic text-gray-400">Untitled</span>}
        </span>
      );
    },
  },
  {
    id: 'tags',
    header: 'Tags',
    renderCell: (v) =>
      Array.isArray(v) && v.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {v.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400 text-xs italic">—</span>
      ),
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    renderCell: (v) => <StatusBadge status={v} />,
  },
  {
    id: 'featuredAnswerIds',
    header: 'Featured',
    sortable: false,
    renderCell: (v) => (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        {Array.isArray(v) ? v.length : 0}
      </span>
    ),
  },
  {
    id: 'publishedAt',
    header: 'Published',
    sortable: true,
    renderCell: (v) =>
      v ? <span className="text-gray-500">{new Date(v).toLocaleDateString()}</span> : '—',
  },
  {
    id: 'expiresAt',
    header: 'Expires',
    sortable: true,
    renderCell: (v) =>
      v ? <span className="text-gray-500">{new Date(v).toLocaleDateString()}</span> : '—',
  },
];

function WallListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { canManage } = useOwnershipScope();
  const [deleteQuestion] = useDeleteWallQuestionMutation();
  const [confirmItem, setConfirmItem] = useState(null);

  const handleDelete = async () => {
    if (!canManage(confirmItem)) {
      enqueueSnackbar('You can only delete records you created', { variant: 'warning' });
      setConfirmItem(null);
      return;
    }
    try {
      await deleteQuestion(confirmItem.id).unwrap();
      enqueueSnackbar('Question deleted', { variant: 'success' });
      setConfirmItem(null);
    } catch (error) {
      enqueueSnackbar(error?.data?.message ?? error?.message ?? 'Delete failed', { variant: 'error' });
    }
  };

  const actions = (row) => {
    const rowActions = [
      {
        icon: <Visibility style={{ fontSize: 18 }} />,
        title: 'View',
        onClick: (e) => {
          e.stopPropagation();
          navigate(`/wall/${row.id}`, { state: { question: row } });
        },
      },
    ];
    if (canManage(row)) {
      rowActions.push(
        {
          icon: <Edit style={{ fontSize: 18 }} />,
          title: 'Edit & Answers',
          onClick: (e) => {
            e.stopPropagation();
            navigate(`/wall/${row.id}`, { state: { question: row } });
          },
        },
        {
          icon: <DeleteOutline style={{ fontSize: 18 }} />,
          title: 'Delete',
          danger: true,
          onClick: (e) => {
            e.stopPropagation();
            setConfirmItem(row);
          },
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
        onRowClick={(row) => navigate(`/wall/${row.id}`, { state: { question: row } })}
        emptyMessage="No wall questions yet. Add one to get started."
      />

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        description={`Delete "${localeText(confirmItem?.text) || 'this question'}" and all its answers? This cannot be undone.`}
      />
    </>
  );
}

export default WallListTable;
