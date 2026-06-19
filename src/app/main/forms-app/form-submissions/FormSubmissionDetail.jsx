import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PictureAsPdf,
  Close,
  CheckBox,
  CheckBoxOutlineBlank,
  CalendarToday,
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress, // used inside ExportPdfDialog
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useExportSubmissionPdfMutation } from '../FormsApi';
import { selectUserRole } from '../../../auth/store/userSlice';
import Breadcrumb from '../../../shared-components/breadcrumb';
import StatusBadge from '../../../shared-components/status-badge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveLabel(obj, locale = 'ar') {
  return obj?.[locale] || obj?.en || obj?.ar || '';
}

function buildAnswerMap(answers) {
  if (!Array.isArray(answers)) return {};
  return answers.reduce((acc, a) => {
    acc[a.questionId] = a.value;
    return acc;
  }, {});
}

function formatAnswer(value, question) {
  if (value === undefined || value === null || value === '') return null;

  switch (question?.type) {
    case 'single_choice': {
      const opt = (question.options ?? []).find((o) => o.id === value);
      return resolveLabel(opt?.label) || value;
    }
    case 'checkbox_group': {
      if (!Array.isArray(value)) return String(value);
      return value
        .map((id) => {
          const opt = (question.options ?? []).find((o) => o.id === id);
          return resolveLabel(opt?.label) || id;
        })
        .join(' ، ');
    }
    case 'date_range':
      return value?.start && value?.end ? `${value.start} → ${value.end}` : null;
    case 'rating':
      return `${value} ★`;
    default:
      return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── PDF Export Dialog ────────────────────────────────────────────────────────

function ExportPdfDialog({ open, onClose, questions, submission, formId }) {
  const [selected, setSelected] = useState(() => new Set(questions.map((q) => q.id)));
  const [locale, setLocale] = useState('ar');
  const [exportPdf, { isLoading }] = useExportSubmissionPdfMutation();

  const allChecked = selected.size === questions.length;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(questions.map((q) => q.id)));
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleExport() {
    const result = await exportPdf({
      formId,
      body: { userId: submission.userId, submissionId: submission.id, questionIds: [...selected], locale },
    });
    if (result.data) {
      const blob = new Blob([result.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submission-${submission.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>Export to PDF</span>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded p-1 text-gray-400 hover:bg-gray-100"
        >
          <Close style={{ fontSize: 20 }} />
        </button>
      </DialogTitle>

      <DialogContent dividers>
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500">Export language</p>
          <ToggleButtonGroup
            value={locale}
            exclusive
            onChange={(_, v) => v && setLocale(v)}
            size="small"
          >
            <ToggleButton value="ar">العربية</ToggleButton>
            <ToggleButton value="en">English</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="mb-2 border-b border-gray-100 pb-2">
          <FormControlLabel
            control={
              <Checkbox
                checked={allChecked}
                indeterminate={selected.size > 0 && !allChecked}
                onChange={toggleAll}
                size="small"
              />
            }
            label={<span className="text-sm font-medium text-gray-700">Select all questions</span>}
          />
        </div>

        <FormGroup className="max-h-72 overflow-y-auto pr-1">
          {questions.map((q) => (
            <FormControlLabel
              key={q.id}
              control={
                <Checkbox
                  checked={selected.has(q.id)}
                  onChange={() => toggleOne(q.id)}
                  size="small"
                  icon={<CheckBoxOutlineBlank style={{ fontSize: 18 }} />}
                  checkedIcon={<CheckBox style={{ fontSize: 18 }} />}
                />
              }
              label={
                <span className="text-sm text-gray-700" dir="rtl">
                  {resolveLabel(q.title, locale) || `Question ${q.orderIndex + 1}`}
                </span>
              }
            />
          ))}
        </FormGroup>
      </DialogContent>

      <DialogActions className="gap-2 px-6 py-3">
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isLoading || selected.size === 0}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdf />}
          sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
        >
          {isLoading ? 'Exporting…' : 'Export PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FormSubmissionDetail() {
  const { formId } = useParams();
  const location = useLocation();
  const [exportOpen, setExportOpen] = useState(false);
  const role = useSelector(selectUserRole);

  const { submission, questions: stateQuestions = [], formName = 'Form' } = location.state ?? {};

  const questions = [...stateQuestions].sort((a, b) => a.orderIndex - b.orderIndex);
  const displayQuestions = questions.filter((q) => q.type !== 'section');

  const answerMap = buildAnswerMap(submission?.answers);
  const isSuperAdmin = role === 'SuperAdmin' || role === 'super_admin';

  return (
    <div className="mx-auto max-w-3xl p-6 pt-4">
      <Breadcrumb
        items={[
          { label: 'Forms', href: '/forms' },
          { label: formName, href: `/forms/${formId}` },
          { label: 'Submissions', href: `/forms/${formId}/submissions` },
          { label: 'Submission Detail' },
        ]}
      />

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Submission Detail</h1>
          {submission && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge status={(submission.status ?? 'pending').toLowerCase()} />
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <CalendarToday style={{ fontSize: 14 }} />
                {formatDate(submission.submittedAt)}
              </span>
            </div>
          )}
        </div>

        {isSuperAdmin && submission && (
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <PictureAsPdf style={{ fontSize: 18, color: '#dc2626' }} />
            Export PDF
          </button>
        )}
      </div>

      {/* Q&A list */}
      {!submission ? (
        <div className="flex justify-center py-16 text-sm text-gray-400">
          No submission data available.
        </div>
      ) : (
        <div className="space-y-6" dir="rtl">
          {displayQuestions.map((q, idx) => {
            const value = answerMap[q.id];
            const formatted = formatAnswer(value, q);
            return (
              <div key={q.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  سؤال {idx + 1}
                </p>
                <p className="mb-3 text-sm font-medium leading-relaxed text-gray-800">
                  {resolveLabel(q.title) || `Question ${idx + 1}`}
                </p>
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  {formatted ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                      {formatted}
                    </p>
                  ) : (
                    <p className="text-sm italic text-gray-400">لا توجد إجابة</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isSuperAdmin && submission && (
        <ExportPdfDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          questions={displayQuestions}
          submission={submission}
          formId={formId}
        />
      )}
    </div>
  );
}
