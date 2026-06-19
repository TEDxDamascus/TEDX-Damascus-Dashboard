import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Save, Publish, UnpublishedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../../shared-components/status-badge';
import ConfirmModal from '../../../shared-components/confirm-modal';

export default function FormBuilderHeader({
  isNew,
  formName,
  status,
  onSave,
  isSaving,
  onPublish,
  onUnpublish,
  isPublishing,
  isUnpublishing,
}) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPublished = status === 'Published' || status === 'published';
  const displayName = formName?.en || formName?.ar || 'Untitled Form';

  const handlePublishClick = () => setConfirmOpen(true);

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (isPublished) {
      onUnpublish();
    } else {
      onPublish();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-tedx-dark">
            {isNew ? 'Create Form' : displayName}
          </h1>
          {!isNew && status && <StatusBadge status={isPublished ? 'published' : 'draft'} />}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/forms')}
            sx={{ borderColor: '#e0e0e0', color: '#666' }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={onSave}
            disabled={isSaving}
            sx={{
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            {isSaving ? 'Saving…' : isNew ? 'Create Form' : 'Save Settings'}
          </Button>

          {!isNew && (
            <Button
              variant="contained"
              startIcon={
                isPublishing || isUnpublishing ? (
                  <CircularProgress size={14} color="inherit" />
                ) : isPublished ? (
                  <UnpublishedOutlined />
                ) : (
                  <Publish />
                )
              }
              onClick={handlePublishClick}
              disabled={isPublishing || isUnpublishing}
              sx={
                isPublished
                  ? { backgroundColor: '#374151', '&:hover': { backgroundColor: '#1f2937' } }
                  : {
                      backgroundColor: 'var(--color-primary)',
                      '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
                    }
              }
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={isPublishing || isUnpublishing}
        variant="warning"
        confirmLabel={isPublished ? 'Unpublish' : 'Publish'}
        title={isPublished ? 'Unpublish Form' : 'Publish Form'}
        description={
          isPublished
            ? `Unpublishing "${displayName}" will hide it from applicants. Continue?`
            : `Publishing "${displayName}" will make it visible to applicants. Continue?`
        }
      />
    </>
  );
}
