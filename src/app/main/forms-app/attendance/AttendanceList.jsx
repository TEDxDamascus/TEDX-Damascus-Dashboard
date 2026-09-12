import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Close, Send, Mail } from '@mui/icons-material';
import {
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
import { useGetAttendanceListQuery, useInviteAttendanceListMutation } from '../AttendanceApi';
import { useTableState } from '../../../shared-components/custom-table';
import CustomTable from '../../../shared-components/custom-table';
import StatusBadge from '../../../shared-components/status-badge';
import Breadcrumb from '../../../shared-components/breadcrumb';
import RichTextEditor from '../../../shared-components/rich-text-editor';

const TABLE_ID = 'attendance-list';

function resolveLabel(obj, locale = 'ar') {
  return obj?.[locale] || obj?.en || obj?.ar || '';
}

function isHtmlEmpty(html) {
  return !html || !html.replace(/<[^>]*>/g, '').trim();
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
  const [subject, setSubject] = useState("You're invited!");
  const [htmlMessage, setHtmlMessage] = useState(
    '<p>Hi,</p><p>You have been accepted to attend. Please show this email at the gate.</p>',
  );
  const [inviteAttendanceList, { isLoading }] = useInviteAttendanceListMutation();

  async function handleSend() {
    try {
      const result = await inviteAttendanceList({
        attendanceIds,
        subject,
        htmlMessage,
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AttendanceList() {
  const { formId } = useParams();
  const [selectedIds, setSelectedIds] = useState([]);
  const [inviteTarget, setInviteTarget] = useState(null); // array of attendanceIds

  const { data: formResponse } = useGetFormQuery(formId);
  const form = formResponse?.data;
  const formName = resolveLabel(form?.name) || 'Form';
  const eventId = form?.eventId;

  const { params } = useTableState(TABLE_ID);
  const { data, isLoading, isError, error } = useGetAttendanceListQuery(
    { eventId, page: params.page, pageSize: params.pageSize },
    { skip: !eventId },
  );

  const attendees = data?.data?.items ?? [];
  const totalCount = data?.data?.total ?? attendees.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [params.page, formId]);

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
      <Breadcrumb
        items={[
          { label: 'Forms', href: '/forms' },
          { label: formName, href: `/forms/${formId}` },
          { label: 'Submissions', href: `/forms/${formId}/submissions` },
          { label: 'Attendance' },
        ]}
      />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Attendance List</h1>
          <p className="mt-1 text-sm text-gray-500" dir="rtl">
            {formName}
          </p>
        </div>
        {totalCount > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {totalCount}
          </span>
        )}
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
            ? 'This form is not linked to an event.'
            : isError
              ? (error?.data?.message ?? error?.message ?? 'Failed to load attendance list.')
              : 'No one has been added to the attendance list yet. Add attendees from the submissions page.'
        }
      />

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
