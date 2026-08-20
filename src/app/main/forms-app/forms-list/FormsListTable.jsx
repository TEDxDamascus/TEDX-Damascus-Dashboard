import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Edit,
  DeleteOutline,
  Visibility,
  Publish,
  UnpublishedOutlined,
  InboxOutlined,
} from '@mui/icons-material';
import {
  useDeleteFormMutation,
  usePublishFormMutation,
  useUnpublishFormMutation,
} from '../FormsApi';
import CustomTable from '../../../shared-components/custom-table';
import ConfirmModal from '../../../shared-components/confirm-modal';
import StatusBadge from '../../../shared-components/status-badge';
import { useOwnershipScope } from '../../../shared/ownership/useOwnershipScope';

const TABLE_ID = 'forms';

const COLUMNS = [
  {
    id: 'name',
    header: 'Form Name',
    sortable: true,
    renderCell: (value) => (
      <span className="font-medium text-tedx-dark">{value?.en || value?.ar || '—'}</span>
    ),
  },
  {
    id: 'targetRole',
    header: 'Target Role',
    sortable: true,
    renderCell: (value) => (
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        {value ?? '—'}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    renderCell: (value) => <StatusBadge status={(value ?? 'draft').toLowerCase()} />,
  },
  {
    id: 'questions',
    header: 'Questions',
    renderCell: (_, row) => (
      <span className="text-sm text-gray-500">{row.questions?.length ?? 0}</span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Created',
    sortable: true,
    renderCell: (value) =>
      value
        ? new Date(value).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
  },
];

function isPublished(row) {
  return row.status === 'Published' || row.status === 'published';
}

function FormsListTable({ data, totalCount, isLoading }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { canManage } = useOwnershipScope();

  const [deleteForm, { isLoading: isDeleting }] = useDeleteFormMutation();
  const [publishForm, { isLoading: isPublishing }] = usePublishFormMutation();
  const [unpublishForm, { isLoading: isUnpublishing }] = useUnpublishFormMutation();

  const [deleteItem, setDeleteItem] = useState(null);
  const [publishItem, setPublishItem] = useState(null); // row to publish/unpublish

  const handleDeleteConfirm = async () => {
    if (!canManage(deleteItem)) {
      enqueueSnackbar('You can only delete records you created', { variant: 'warning' });
      setDeleteItem(null);
      return;
    }
    try {
      await deleteForm(deleteItem.id).unwrap();
      enqueueSnackbar('Form deleted successfully', { variant: 'success' });
      setDeleteItem(null);
    } catch {
      enqueueSnackbar('Failed to delete form', { variant: 'error' });
    }
  };

  const handlePublishConfirm = async () => {
    if (!canManage(publishItem)) {
      enqueueSnackbar('You can only manage records you created', { variant: 'warning' });
      setPublishItem(null);
      return;
    }
    const publish = !isPublished(publishItem);
    try {
      if (publish) {
        await publishForm(publishItem.id).unwrap();
        enqueueSnackbar('Form published', { variant: 'success' });
      } else {
        await unpublishForm(publishItem.id).unwrap();
        enqueueSnackbar('Form unpublished', { variant: 'info' });
      }
      setPublishItem(null);
    } catch {
      enqueueSnackbar(`Failed to ${publish ? 'publish' : 'unpublish'} form`, { variant: 'error' });
    }
  };

  const rowActions = (row) => {
    const actions = [
      {
        icon: <Visibility style={{ fontSize: 18 }} />,
        label: 'View',
        onClick: () => navigate(`/forms/${row.id}`),
      },
    ];
    if (canManage(row)) {
      actions.push({
        icon: <Edit style={{ fontSize: 18 }} />,
        label: 'Edit',
        onClick: () => navigate(`/forms/${row.id}`),
      });
    }
    actions.push({
      icon: <InboxOutlined style={{ fontSize: 18 }} />,
      label: 'Submissions',
      onClick: () => navigate(`/forms/${row.id}/submissions`),
    });
    if (canManage(row)) {
      actions.push(
        {
          icon: isPublished(row) ? (
            <UnpublishedOutlined style={{ fontSize: 18 }} />
          ) : (
            <Publish style={{ fontSize: 18 }} />
          ),
          label: isPublished(row) ? 'Unpublish' : 'Publish',
          onClick: () => setPublishItem(row),
        },
        {
          icon: <DeleteOutline style={{ fontSize: 18 }} />,
          label: 'Delete',
          danger: true,
          onClick: () => setDeleteItem(row),
        },
      );
    }
    return actions;
  };

  const formName = (row) => row?.name?.en || row?.name?.ar || 'this form';

  return (
    <>
      <CustomTable
        tableId={TABLE_ID}
        columns={COLUMNS}
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        rowActions={rowActions}
        emptyMessage="No forms yet. Create your first form!"
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Form"
        description={`Are you sure you want to delete "${formName(deleteItem)}"? This action cannot be undone.`}
      />

      {/* Publish / Unpublish confirm */}
      <ConfirmModal
        open={!!publishItem}
        onClose={() => setPublishItem(null)}
        onConfirm={handlePublishConfirm}
        loading={isPublishing || isUnpublishing}
        variant="warning"
        confirmLabel={isPublished(publishItem ?? {}) ? 'Unpublish' : 'Publish'}
        title={isPublished(publishItem ?? {}) ? 'Unpublish Form' : 'Publish Form'}
        description={
          isPublished(publishItem ?? {})
            ? `Unpublishing "${formName(publishItem)}" will hide it from applicants. Continue?`
            : `Publishing "${formName(publishItem)}" will make it available to applicants. Continue?`
        }
      />
    </>
  );
}

export default FormsListTable;
