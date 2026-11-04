import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import * as XLSX from 'xlsx';
import { Close, Send, Mail, UploadFile, Delete } from '@mui/icons-material';
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useGetFormQuery } from '../FormsApi';
import { useGetEventsQuery } from '../../events-app/EventsApi';
import {
  useGetAttendanceListQuery,
  useInviteAttendanceListMutation,
  useAddAttendanceManuallyMutation,
} from '../AttendanceApi';
import { useTableState } from '../../../shared-components/custom-table';
import CustomTable from '../../../shared-components/custom-table';
import StatusBadge from '../../../shared-components/status-badge';
import Breadcrumb from '../../../shared-components/breadcrumb';
import RichTextEditor from '../../../shared-components/rich-text-editor';

const TABLE_ID = 'attendance-list';
const DEFAULT_PAGE_SIZE = 50;

function resolveLabel(obj, locale = 'ar') {
  if (typeof obj === 'string') return obj;
  return obj?.[locale] || obj?.en || obj?.ar || '';
}

function isHtmlEmpty(html) {
  return !html || !html.replace(/<[^>]*>/g, '').trim();
}

const ARABIC_RE = /[؀-ۿ]/;

// The backend drops the message into an LTR email template as-is, so Arabic
// messages need their own direction or they render left-aligned.
function withTextDirection(html) {
  if (!ARABIC_RE.test(html)) return html;
  return `<div dir="rtl" style="direction:rtl;text-align:right;">${html}</div>`;
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

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({ open, onClose, attendanceIds, onInvited }) {
  const { enqueueSnackbar } = useSnackbar();
  // Start empty: the email is sent exactly as written here, in whatever language.
  const [subject, setSubject] = useState('');
  const [htmlMessage, setHtmlMessage] = useState('');
  const [inviteAttendanceList, { isLoading }] = useInviteAttendanceListMutation();

  async function handleSend() {
    try {
      const result = await inviteAttendanceList({
        attendanceIds,
        subject,
        htmlMessage: withTextDirection(htmlMessage),
      }).unwrap();
      const sent = result?.data?.sent ?? 0;
      const failed = result?.data?.failed ?? 0;
      enqueueSnackbar(
        failed > 0
          ? `Sent ${sent} invitation(s), ${failed} failed.`
          : `Sent ${sent} invitation(s) successfully.`,
        { variant: failed > 0 ? 'warning' : 'success' },
      );
      onInvited?.();
      onClose();
    } catch (err) {
      enqueueSnackbar(err?.data?.message ?? err?.message ?? 'Failed to send invitations', {
        variant: 'error',
      });
    }
  }

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>
          Invite {attendanceIds.length} attendee{attendanceIds.length === 1 ? '' : 's'}
        </span>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded p-1 text-gray-400 hover:bg-gray-100"
        >
          <Close style={{ fontSize: 20 }} />
        </button>
      </DialogTitle>

      <DialogContent dividers className="space-y-4">
        <TextField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          fullWidth
          size="small"
          inputProps={{ dir: 'auto' }}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">Message</p>
          <RichTextEditor
            value={htmlMessage}
            onChange={setHtmlMessage}
            placeholder="Write the invitation message…"
          />
        </div>
      </DialogContent>

      <DialogActions className="gap-2 px-6 py-3">
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={isLoading || !subject.trim() || isHtmlEmpty(htmlMessage)}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <Send />}
          sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
        >
          {isLoading ? 'Sending…' : 'Send Invitations'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Excel Import ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_HEADER_RE = /e-?mail|البريد|الإيميل|الايميل/i;
const NAME_HEADER_RE = /name|الاسم|اسم/i;

// Reads the first sheet and returns [{ email, name }]. Columns are detected by
// header text (email / name, English or Arabic); without a recognisable header,
// the email column is the first one whose values look like emails.
function parseAttendeesSheet(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils
    .sheet_to_json(sheet, { header: 1, defval: '', raw: false })
    .map((r) => r.map((c) => String(c ?? '').trim()))
    .filter((r) => r.some(Boolean));
  if (!rows.length) return [];

  const header = rows[0];
  let emailCol = header.findIndex((h) => EMAIL_HEADER_RE.test(h));
  let nameCol = header.findIndex((h, i) => i !== emailCol && NAME_HEADER_RE.test(h));
  let dataRows = rows.slice(1);

  if (emailCol === -1) {
    dataRows = rows;
    emailCol = header.findIndex((c) => EMAIL_RE.test(c));
    if (emailCol === -1) return [];
    if (nameCol === -1) nameCol = emailCol === 0 ? 1 : 0;
  }

  const seen = new Set();
  const attendees = [];
  for (const row of dataRows) {
    const email = (row[emailCol] ?? '').toLowerCase();
    if (!EMAIL_RE.test(email) || seen.has(email)) continue;
    seen.add(email);
    attendees.push({ email, name: nameCol >= 0 ? (row[nameCol] ?? '') : '' });
  }
  return attendees;
}

function ImportExcelDialog({ open, onClose, eventId, eventPicker, onImported }) {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [failures, setFailures] = useState([]);
  const [addAttendanceManually, { isLoading }] = useAddAttendanceManuallyMutation();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const parsed = parseAttendeesSheet(workbook);
      setFileName(file.name);
      setAttendees(parsed);
      setFailures([]);
      if (!parsed.length) {
        enqueueSnackbar('No valid emails found. Add an "Email" column (and optionally "Name").', {
          variant: 'warning',
        });
      }
    } catch {
      enqueueSnackbar('Could not read this file. Use .xlsx, .xls or .csv.', { variant: 'error' });
    }
  }

  function updateName(index, name) {
    setAttendees((prev) => prev.map((a, i) => (i === index ? { ...a, name } : a)));
  }

  function removeRow(index) {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImport() {
    try {
      const result = await addAttendanceManually({
        eventId,
        attendees: attendees.map(({ email, name }) => (name ? { email, name } : { email })),
      }).unwrap();
      const created = result?.data?.created ?? [];
      const failed = result?.data?.failures ?? [];
      enqueueSnackbar(
        failed.length > 0
          ? `Added ${created.length} attendee(s), ${failed.length} skipped.`
          : `Added ${created.length} attendee(s).`,
        { variant: failed.length > 0 ? 'warning' : 'success' },
      );
      onImported?.(created.map((a) => a?._id || a?.id).filter(Boolean));
      if (failed.length > 0) {
        // Keep only the rows that failed so the reason is visible next to each one.
        const failedEmails = new Set(failed.map((f) => f.email));
        setFailures(failed);
        setAttendees((prev) => prev.filter((a) => failedEmails.has(a.email)));
      } else {
        onClose();
      }
    } catch (err) {
      enqueueSnackbar(err?.data?.message ?? err?.message ?? 'Failed to add attendees', {
        variant: 'error',
      });
    }
  }

  const failureReason = (email) => failures.find((f) => f.email === email)?.reason;

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>Import attendees from Excel</span>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded p-1 text-gray-400 hover:bg-gray-100"
        >
          <Close style={{ fontSize: 20 }} />
        </button>
      </DialogTitle>

      <DialogContent dividers className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFile}
        />
        {eventPicker}
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {fileName ? 'Choose another file' : 'Choose file'}
          </Button>
          <span className="text-sm text-gray-500">
            {fileName || 'The first sheet needs an "Email" column and optionally a "Name" column.'}
          </span>
        </div>

        {attendees.length > 0 && (
          <div className="max-h-96 overflow-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="w-12 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {attendees.map((a, i) => (
                  <tr key={a.email} className="border-t border-gray-100">
                    <td className="px-3 py-1.5">
                      <TextField
                        value={a.name}
                        onChange={(e) => updateName(i, e.target.value)}
                        size="small"
                        variant="standard"
                        fullWidth
                        placeholder="—"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      {a.email}
                      {failureReason(a.email) && (
                        <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">
                          {failureReason(a.email)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <button
                        onClick={() => removeRow(i)}
                        disabled={isLoading}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Delete style={{ fontSize: 18 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>

      <DialogActions className="gap-2 px-6 py-3">
        <Button onClick={onClose} disabled={isLoading}>
          {failures.length > 0 ? 'Close' : 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={isLoading || !eventId || attendees.length === 0}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : <UploadFile />}
          sx={{ backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
        >
          {isLoading
            ? 'Adding…'
            : !eventId
              ? 'Select an event'
              : `Add ${attendees.length} to Attendance`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// Opened from a form (/forms/:formId/attendance) the event comes from the form;
// opened from the sidebar (/attendance) the event is picked and kept in ?eventId.
export default function AttendanceList() {
  const { formId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState([]);
  const [inviteTarget, setInviteTarget] = useState(null); // array of attendanceIds
  const [importOpen, setImportOpen] = useState(false);

  const { data: formResponse } = useGetFormQuery(formId, { skip: !formId });
  const form = formResponse?.data;
  const formName = resolveLabel(form?.name) || 'Form';

  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery(
    { page: 1, pageSize: 1000 },
    { skip: !!formId },
  );
  const events = eventsData?.items ?? [];

  const eventId = formId ? form?.eventId : searchParams.get('eventId') || undefined;
  const selectedEvent = events.find((e) => e.id === eventId) ?? null;

  function handleEventChange(event) {
    setSelectedIds([]);
    setSearchParams(event ? { eventId: event.id } : {}, { replace: true });
  }

  const eventPicker = (
    <Autocomplete
      sx={{ width: 360, maxWidth: '100%' }}
      size="small"
      options={events}
      loading={eventsLoading}
      value={selectedEvent}
      onChange={(_, value) => handleEventChange(value)}
      getOptionLabel={(e) => resolveLabel(e.title, 'en') || resolveLabel(e.title)}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={eventsLoading ? 'Loading events…' : 'No events found'}
      renderInput={(inputProps) => (
        <TextField {...inputProps} label="Event" placeholder="Select an event" />
      )}
    />
  );

  const { params, setPage, setPageSize } = useTableState(TABLE_ID);

  // Attendance lists are long, so start at 50 rows unless the user already picked a size.
  const hasTableState = useSelector((state) => !!state.table?.tables[TABLE_ID]);
  useEffect(() => {
    if (!hasTableState) setPageSize(DEFAULT_PAGE_SIZE);
  }, [hasTableState, setPageSize]);

  const { data, isLoading, isError, error } = useGetAttendanceListQuery(
    { eventId, page: params.page, pageSize: params.pageSize },
    { skip: !eventId || !hasTableState },
  );

  const attendees = data?.data?.items ?? [];
  const totalCount = data?.data?.total ?? attendees.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [params.page, formId, eventId]);

  const COLUMNS = [
    {
      id: 'select',
      header: '',
      sortable: false,
      headerClassName: 'w-12',
      renderCell: (_, row, { selectedIds: sel, onSelectChange }) => (
        <Checkbox
          size="small"
          checked={sel.includes(row.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const checked = e.target.checked;
            onSelectChange((prev) =>
              checked ? [...prev, row.id] : prev.filter((x) => x !== row.id),
            );
          }}
        />
      ),
    },
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      renderCell: (value) => <span className="font-medium text-tedx-dark">{value || '—'}</span>,
    },
    { id: 'email', header: 'Email' },
    {
      id: 'status',
      header: 'Status',
      renderCell: (value) => <StatusBadge status={(value ?? 'accepted').toLowerCase()} />,
    },
    {
      id: 'invitationSentAt',
      header: 'Invited At',
      renderCell: (value) => (
        <span className="whitespace-nowrap text-sm text-gray-500">{formatDate(value)}</span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Added At',
      sortable: true,
      renderCell: (value) => (
        <span className="whitespace-nowrap text-sm text-gray-500">{formatDate(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => [
    {
      icon: <Mail style={{ fontSize: 18 }} />,
      label: row.status === 'invited' ? 'Re-invite' : 'Invite',
      onClick: () => setInviteTarget([row.id]),
    },
  ];

  const bulkActions =
    selectedIds.length > 0
      ? [
          {
            icon: <Mail style={{ fontSize: 16 }} />,
            label: `Invite Selected (${selectedIds.length})`,
            onClick: () => setInviteTarget(selectedIds),
          },
        ]
      : [];

  return (
    <div className="p-6 pt-4">
      {formId && (
        <Breadcrumb
          items={[
            { label: 'Forms', href: '/forms' },
            { label: formName, href: `/forms/${formId}` },
            { label: 'Submissions', href: `/forms/${formId}/submissions` },
            { label: 'Attendance' },
          ]}
        />
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Attendance List</h1>
          {formId ? (
            <p className="mt-1 text-sm text-gray-500" dir="rtl">
              {formName}
            </p>
          ) : (
            <div className="mt-3">{eventPicker}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setImportOpen(true)}
            title="Import an Excel file with Email and Name columns"
            className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            <UploadFile style={{ fontSize: 16 }} />
            Import from Excel
          </button>
          {totalCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
              {totalCount}
            </span>
          )}
        </div>
      </div>

      <CustomTable
        tableId={TABLE_ID}
        columns={COLUMNS}
        data={attendees}
        totalCount={totalCount}
        isLoading={isLoading}
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        emptyMessage={
          !eventId
            ? formId
              ? 'This form is not linked to an event.'
              : 'Select an event to see its attendance list.'
            : isError
              ? (error?.data?.message ?? error?.message ?? 'Failed to load attendance list.')
              : 'No one has been added to the attendance list yet. Add attendees from the submissions page or import them from Excel.'
        }
      />

      {importOpen && (
        <ImportExcelDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          eventId={eventId}
          eventPicker={formId ? null : eventPicker}
          onImported={(ids) => {
            // The list is newest-first, so the imported attendees land on page 1.
            setPage(1);
            if (ids.length > 0) setSelectedIds(ids);
          }}
        />
      )}

      {inviteTarget && (
        <InviteDialog
          open={!!inviteTarget}
          onClose={() => setInviteTarget(null)}
          attendanceIds={inviteTarget}
          onInvited={() => setSelectedIds([])}
        />
      )}
    </div>
  );
}
