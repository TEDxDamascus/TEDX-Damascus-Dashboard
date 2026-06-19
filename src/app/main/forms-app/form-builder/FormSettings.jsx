import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ContentCopy, Check, LinkOutlined } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parseISO, formatISO, isValid } from 'date-fns';
import { LocaleInput } from '../../../shared-components/locale-input';
import RichTextEditor from '../../../shared-components/rich-text-editor';
import { TARGET_ROLES } from './questionUtils';

const pickerSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-primary)' },
  '& .MuiIconButton-root': { color: 'var(--color-primary)' },
};

// Two rich text editors side by side (EN left, AR right)
function LocaleRichTextEditor({ value = { en: '', ar: '' }, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <span className="mb-1 block text-xs font-medium text-gray-400">EN</span>
        <div dir="ltr">
          <RichTextEditor
            value={value.en ?? ''}
            onChange={(html) => onChange({ ...value, en: html })}
            placeholder="Description (English)"
          />
        </div>
      </div>
      <div>
        <span className="mb-1 block text-xs font-medium text-gray-400">AR</span>
        <div dir="rtl">
          <RichTextEditor
            value={value.ar ?? ''}
            onChange={(html) => onChange({ ...value, ar: html })}
            placeholder="الوصف (العربية)"
          />
        </div>
      </div>
    </div>
  );
}

// Shared input style
const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red';

// Section heading helper
function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
      <h3 className="text-sm font-semibold text-gray-600">{children}</h3>
    </div>
  );
}

// Shareable URL panel
function ShareableUrlPanel({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <LinkOutlined style={{ fontSize: 16 }} className="text-gray-400" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Shareable Link
        </span>
      </div>
      {url ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-tedx-red hover:text-tedx-red"
          >
            {copied ? (
              <>
                <Check style={{ fontSize: 16 }} className="text-green-500" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <ContentCopy style={{ fontSize: 16 }} />
                Copy
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Available after the form is published.</p>
      )}
    </div>
  );
}

export default function FormSettings({ control, shareableUrl }) {
  const selectSx = {
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-primary)' },
  };
  const menuSx = {
    PaperProps: {
      sx: {
        '& .MuiMenuItem-root.Mui-selected': {
          backgroundColor: 'rgba(235, 0, 40, 0.08)',
          color: 'var(--color-primary)',
          fontWeight: 600,
        },
        '& .MuiMenuItem-root:hover': { backgroundColor: 'rgba(235, 0, 40, 0.05)' },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* ── Basic Info ── */}
      <div className="space-y-6">
        <SectionHeading>Basic Information</SectionHeading>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Form Name</label>
          <Controller
            name="name"
            control={control}
            rules={{ validate: (v) => !!(v?.en?.trim() || v?.ar?.trim()) || 'Name is required' }}
            render={({ field, fieldState }) => (
              <LocaleInput
                {...field}
                label="Name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LocaleRichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Target Role</label>
          <Controller
            name="targetRole"
            control={control}
            render={({ field }) => (
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ '&.Mui-focused': { color: 'var(--color-primary)' } }}>
                  Role
                </InputLabel>
                <Select {...field} label="Role" sx={selectSx} MenuProps={menuSx}>
                  {TARGET_ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </div>
      </div>

      {/* ── Scheduling ── */}
      <div className="space-y-4">
        <SectionHeading>Scheduling</SectionHeading>
        <p className="text-xs text-gray-400">Leave empty to keep the form open indefinitely.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { name: 'starts_at', label: 'Opens At', hint: 'Form not accessible before this date.' },
            { name: 'ends_at', label: 'Closes At', hint: 'Form stops accepting responses.' },
            {
              name: 'expires_at',
              label: 'Expires At',
              hint: 'Hard expiry — returns 410 after this.',
            },
          ].map(({ name, label, hint }) => (
            <div key={name}>
              <Controller
                name={name}
                control={control}
                render={({ field }) => {
                  const dtValue = field.value
                    ? (() => {
                        const d = parseISO(field.value);
                        return isValid(d) ? d : null;
                      })()
                    : null;
                  return (
                    <DateTimePicker
                      label={label}
                      value={dtValue}
                      onChange={(newDt) =>
                        field.onChange(newDt && isValid(newDt) ? formatISO(newDt) : '')
                      }
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      sx={pickerSx}
                    />
                  );
                }}
              />
              <p className="mt-1 text-xs text-gray-400">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Limits ── */}
      <div className="space-y-4">
        <SectionHeading>Submission Limits</SectionHeading>

        <div className="max-w-xs">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Max Submissions</label>
          <Controller
            name="max_submissions"
            control={control}
            render={({ field }) => (
              <input
                value={field.value ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    field.onChange('');
                    return;
                  }
                  const parsed = parseInt(raw, 10);
                  if (!Number.isNaN(parsed) && parsed >= 1) {
                    field.onChange(parsed);
                  }
                }}
                type="number"
                min={1}
                step={1}
                placeholder="Unlimited"
                className={inputCls}
              />
            )}
          />
          <p className="mt-1 text-xs text-gray-400">
            Form closes automatically when this limit is reached.
          </p>
        </div>
      </div>

      {/* ── Share ── */}
      <div className="space-y-4">
        <SectionHeading>Share</SectionHeading>
        <ShareableUrlPanel url={shareableUrl} />
      </div>
    </div>
  );
}
