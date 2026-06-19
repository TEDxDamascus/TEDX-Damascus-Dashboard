import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Paper, Tabs, Tab, Button } from '@mui/material';
import { Save, Publish, UnpublishedOutlined } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import StatusBadge from '../../../shared-components/status-badge';
import ConfirmModal from '../../../shared-components/confirm-modal';
import { useFormBuilder } from './useFormBuilder';
import FormSettings from './FormSettings';
import QuestionList from './QuestionList';

export default function FormBuilder() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    isNew,
    form,
    isFormLoading,
    refetchForm,
    settingsForm,
    saveSettings,
    isSavingSettings,
    questions,
    lastAddedIndex,
    isAddingQuestion,
    handleAddQuestion,
    handleUpdateQuestion,
    handleRemoveQuestion,
    handlePublish,
    handleUnpublish,
    isPublishing,
    isUnpublishing,
  } = useFormBuilder(formId);

  if (!isNew && isFormLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const isPublished = form?.status === 'Published' || form?.status === 'published';
  const displayName = form?.name?.en || form?.name?.ar || 'Untitled Form';

  const handlePublishConfirm = () => {
    setConfirmOpen(false);
    if (isPublished) handleUnpublish();
    else handlePublish();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 pt-8">
      <Breadcrumb
        items={[{ label: 'Forms', href: '/forms' }, { label: isNew ? 'Create Form' : displayName }]}
      />

      {/* Title + actions — no background */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-tedx-dark">
            {isNew ? 'Create Form' : displayName}
          </h1>
          {!isNew && form?.status && <StatusBadge status={isPublished ? 'published' : 'draft'} />}
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
            startIcon={isSavingSettings ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={saveSettings}
            disabled={isSavingSettings}
            sx={{
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            {isSavingSettings ? 'Saving…' : isNew ? 'Create Form' : 'Save Settings'}
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
              onClick={() => setConfirmOpen(true)}
              disabled={isPublishing || isUnpublishing}
              sx={
                isPublished
                  ? { backgroundColor: '#374151', '&:hover': { backgroundColor: '#1f2937' } }
                  : {
                      backgroundColor: '#d97706',
                      '&:hover': { backgroundColor: '#b45309' },
                      color: '#fff',
                    }
              }
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      <Paper
        elevation={0}
        sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            if (v === 1) refetchForm();
          }}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 3,
            '& .MuiTab-root.Mui-selected': { color: 'var(--color-primary)' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' },
          }}
        >
          <Tab label="Basic Information" />
          <Tab label="Questions" disabled={isNew} />
        </Tabs>

        <div className="p-6">
          {tab === 0 && (
            <FormSettings
              control={settingsForm.control}
              shareableUrl={
                typeof form?.shareable_url === 'string'
                  ? form.shareable_url
                  : form?.shareable_url?.en || form?.shareable_url?.ar || ''
              }
            />
          )}
          {tab === 1 && !isNew && (
            <QuestionList
              questions={questions}
              lastAddedIndex={lastAddedIndex}
              isPublished={isPublished}
              isAddingQuestion={isAddingQuestion}
              onAdd={handleAddQuestion}
              onUpdate={handleUpdateQuestion}
              onRemove={handleRemoveQuestion}
            />
          )}
        </div>
      </Paper>

      {isNew && (
        <p className="mt-4 text-center text-sm text-gray-400">
          Fill in the basic information above, then click &ldquo;Create Form&rdquo; to start adding
          questions.
        </p>
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handlePublishConfirm}
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
    </div>
  );
}
