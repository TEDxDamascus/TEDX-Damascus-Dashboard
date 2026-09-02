import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import * as XLSX from 'xlsx';
import {
  Visibility,
  Person,
  PictureAsPdf,
  TableChart,
  Close,
  CheckBox,
  CheckBoxOutlineBlank,
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
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  useGetFormQuery,
  useGetFormSubmissionsQuery,
  useLazyGetFormSubmissionsQuery,
  useExportSubmissionPdfMutation,
} from '../FormsApi';
import { useTableState } from '../../../shared-components/custom-table';
import CustomTable from '../../../shared-components/custom-table';
import StatusBadge from '../../../shared-components/status-badge';
import Breadcrumb from '../../../shared-components/breadcrumb';

const TABLE_ID = 'form-submissions';
// Backend OffsetPaginationDto caps `limit` at 100.
const API_PAGE_LIMIT = 100;

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
  if (value === undefined || value === null || value === '') return '—';

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
      return value?.start && value?.end ? `${value.start} → ${value.end}` : '—';
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

function mapSubmission(sub) {
  return { ...sub, _answerMap: buildAnswerMap(sub.answers) };
}

export default function FormSubmissions() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [exportTarget, setExportTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: formResponse } = useGetFormQuery(formId);
  const form = formResponse?.data;
  const formName = resolveLabel(form?.name) || 'Form';

  const allQuestions = [...(form?.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  const displayQuestions = allQuestions.filter((q) => q.type !== 'section');

  // Only 3 question columns so the action buttons stay reachable
  const colQuestions = displayQuestions.slice(0, 3);

  const { params } = useTableState(TABLE_ID);
  const pageSize = Math.min(params.pageSize || 10, API_PAGE_LIMIT);
  const { data, isLoading, isError, error } = useGetFormSubmissionsQuery({
    formId,
    page: params.page,
    pageSize,
  });
  const [fetchSubmissions] = useLazyGetFormSubmissionsQuery();

  const submissions = (data?.data?.items ?? []).map(mapSubmission);
  const totalCount = data?.data?.total ?? submissions.length;

  async function handleExportExcel() {
    setIsExporting(true);
    try {
      const collected = [];
      let page = 1;
      let total = Infinity;

      while (collected.length < total) {
        const result = await fetchSubmissions({
          formId,
          page,
          pageSize: API_PAGE_LIMIT,
        }).unwrap();
        const items = result?.data?.items ?? [];
        total = result?.data?.total ?? collected.length + items.length;
        collected.push(...items);
        if (!items.length) break;
        page += 1;
      }

      const headers = [
        'Submission ID',
        ...displayQuestions.map((q) => resolveLabel(q.title) || `Question ${q.orderIndex + 1}`),
        'Status',
        'Submitted At',
      ];

      const rows = collected.map((sub) => {
        const answerMap = buildAnswerMap(sub.answers);
        return [
          sub.id,
          ...displayQuestions.map((q) => {
            const val = formatAnswer(answerMap[q.id], q);
            return val === '—' ? '' : val;
          }),
          sub.status ?? 'pending',
          formatDate(sub.submittedAt),
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = headers.map((_, i) => ({ wch: i === 0 ? 28 : 24 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${formId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      enqueueSnackbar(err?.data?.message ?? err?.message ?? 'Failed to export submissions', {
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  }

  const COLUMNS = [
    ...colQuestions.map((q) => ({
      id: `answer_${q.id}`,
      header: resolveLabel(q.title),
      renderCell: (_, row) => {
        const value = row._answerMap?.[q.id];
        const text = formatAnswer(value, q);
        return (
          <span
            className="block max-w-[160px] truncate text-sm text-gray-700"
            dir="rtl"
            title={text !== '—' ? text : undefined}
          >
            {text}
          </span>
        );
      },
    })),
    {
      id: 'status',
      header: 'Status',
      renderCell: (value) => <StatusBadge status={(value ?? 'pending').toLowerCase()} />,
    },
    {
      id: 'submittedAt',
      header: 'Submitted At',
      sortable: true,
      renderCell: (value) => (
        <span className="whitespace-nowrap text-sm text-gray-500">{formatDate(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => [
    {
      icon: <Visibility style={{ fontSize: 18 }} />,
      label: 'View',
      onClick: () =>
        navigate(`/forms/${formId}/submissions/${row.id}`, {
          state: { submission: row, questions: allQuestions, formName },
        }),
    },
    {
      icon: <PictureAsPdf style={{ fontSize: 18, color: '#dc2626' }} />,
      label: 'Export PDF',
      onClick: () => setExportTarget(row),
    },
  ];

  return (
    <div className="p-6 pt-4">
      <Breadcrumb
        items={[
          { label: 'Forms', href: '/forms' },
          { label: formName, href: `/forms/${formId}` },
          { label: 'Submissions' },
        ]}
      />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Submissions</h1>
          <p className="mt-1 text-sm text-gray-500" dir="rtl">
            {formName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <TableChart style={{ fontSize: 16 }} />
              {isExporting ? 'Exporting…' : 'Export Excel'}
            </button>
          )}
          {totalCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
              <Person style={{ fontSize: 16 }} />
              {totalCount}
            </span>
          )}
        </div>
      </div>

      <CustomTable
        tableId={TABLE_ID}
        columns={COLUMNS}
        data={submissions}
        totalCount={totalCount}
        isLoading={isLoading}
        rowActions={rowActions}
        emptyMessage={
          isError
            ? error?.data?.message ?? error?.message ?? 'Failed to load submissions.'
            : 'No submissions yet for this form.'
        }
      />

      {exportTarget && (
        <ExportPdfDialog
          open={!!exportTarget}
          onClose={() => setExportTarget(null)}
          questions={displayQuestions}
          submission={exportTarget}
          formId={formId}
        />
      )}
    </div>
  );
}
