import { useState, useRef } from 'react';
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  DeleteOutline,
  Add,
  Close,
  ExpandMore,
  ExpandLess,
  CheckOutlined,
  UndoOutlined,
} from '@mui/icons-material';
import { CircularProgress, Switch, Tooltip } from '@mui/material';
import { getTypeLabel, hasOptions, isSection } from './questionUtils';
import ConfirmModal from '../../../shared-components/confirm-modal';

// ─── Locale field ─────────────────────────────────────────────────────────────
function LocaleField({ label, value = { en: '', ar: '' }, onChange, multiline = false }) {
  const Tag = multiline ? 'textarea' : 'input';
  const base =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red';
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <span className="mb-1 block text-xs font-medium text-gray-400">EN</span>
        <Tag
          className={`${base} ${multiline ? 'min-h-[72px] resize-y' : ''}`}
          dir="ltr"
          value={value.en ?? ''}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder={`${label} (English)`}
          rows={multiline ? 2 : undefined}
        />
      </div>
      <div>
        <span className="mb-1 block text-xs font-medium text-gray-400">AR</span>
        <Tag
          className={`${base} ${multiline ? 'min-h-[72px] resize-y' : ''}`}
          dir="rtl"
          value={value.ar ?? ''}
          onChange={(e) => onChange({ ...value, ar: e.target.value })}
          placeholder={`${label} (العربية)`}
          rows={multiline ? 2 : undefined}
        />
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red';

// Convert YYYY-MM-DD ↔ ISO timestamps for date config fields
const toMinISO = (d) => (d ? `${d}T00:00:00.000Z` : '');
const toMaxISO = (d) => (d ? `${d}T23:59:59.999Z` : '');
const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

// ─── Per-type config fields ───────────────────────────────────────────────────
function ConfigFields({ type, config = {}, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });

  if (type === 'short_text') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min Length</label>
          <input
            type="number"
            min={0}
            value={config.min_length ?? ''}
            placeholder="No minimum"
            onChange={(e) =>
              update('min_length', e.target.value !== '' ? Number(e.target.value) : '')
            }
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max Length</label>
          <input
            type="number"
            min={1}
            value={config.max_length ?? ''}
            placeholder="No limit"
            onChange={(e) =>
              update('max_length', e.target.value !== '' ? Number(e.target.value) : '')
            }
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'long_text') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min Length</label>
          <input
            type="number"
            min={0}
            value={config.min_length ?? ''}
            placeholder="No minimum"
            onChange={(e) =>
              update('min_length', e.target.value !== '' ? Number(e.target.value) : '')
            }
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max Length</label>
          <input
            type="number"
            min={1}
            value={config.max_length ?? ''}
            placeholder="No limit"
            onChange={(e) =>
              update('max_length', e.target.value !== '' ? Number(e.target.value) : '')
            }
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'number') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min</label>
          <input
            type="number"
            value={config.min ?? ''}
            placeholder="No limit"
            onChange={(e) => update('min', e.target.value !== '' ? Number(e.target.value) : '')}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max</label>
          <input
            type="number"
            value={config.max ?? ''}
            placeholder="No limit"
            onChange={(e) => update('max', e.target.value !== '' ? Number(e.target.value) : '')}
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'rating') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min</label>
          <input
            type="number"
            min={0}
            value={config.min ?? 1}
            onChange={(e) => update('min', Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max</label>
          <input
            type="number"
            min={2}
            max={10}
            value={config.max ?? 5}
            onChange={(e) => update('max', Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min Date</label>
          <input
            type="date"
            value={toDateInput(config.min_date)}
            onChange={(e) => update('min_date', toMinISO(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max Date</label>
          <input
            type="date"
            value={toDateInput(config.max_date)}
            onChange={(e) => update('max_date', toMaxISO(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'date_range') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min Date</label>
          <input
            type="date"
            value={toDateInput(config.min_date)}
            onChange={(e) => update('min_date', toMinISO(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max Date</label>
          <input
            type="date"
            value={toDateInput(config.max_date)}
            onChange={(e) => update('max_date', toMaxISO(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'checkbox_group') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Min Selected</label>
          <input
            type="number"
            min={0}
            value={config.min_selected ?? ''}
            placeholder="No minimum"
            onChange={(e) =>
              update('min_selected', e.target.value !== '' ? Number(e.target.value) : '')
            }
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Max Selected</label>
          <input
            type="number"
            min={1}
            value={config.max_selected ?? ''}
            placeholder="No limit"
            onChange={(e) =>
              update('max_selected', e.target.value !== '' ? Number(e.target.value) : '')
            }
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  if (type === 'file_upload') {
    const allowedTypes = config.allowed_types ?? [];
    const toggleType = (t) => {
      const next = allowedTypes.includes(t)
        ? allowedTypes.filter((x) => x !== t)
        : [...allowedTypes, t];
      update('allowed_types', next);
    };
    return (
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500">Allowed File Types</label>
          <div className="flex flex-wrap gap-2">
            {['pdf', 'jpg', 'png', 'docx', 'mp4', 'xlsx'].map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:border-tedx-red"
              >
                <input
                  type="checkbox"
                  checked={allowedTypes.includes(t)}
                  onChange={() => toggleType(t)}
                  className="accent-tedx-red"
                />
                <span className="font-medium uppercase text-gray-600">{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Max Size (MB)</label>
            <input
              type="number"
              min={1}
              value={config.max_size_mb ?? ''}
              placeholder="10"
              onChange={(e) =>
                update('max_size_mb', e.target.value ? Number(e.target.value) : undefined)
              }
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Max Files</label>
            <input
              type="number"
              min={1}
              value={config.max_files ?? ''}
              placeholder="1"
              onChange={(e) =>
                update('max_files', e.target.value ? Number(e.target.value) : undefined)
              }
              className={inputCls}
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'section') {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-4">
        <div className="border-t-2 border-gray-300" />
        <p className="mt-2 text-xs text-gray-400">
          Visual section break. Use the title and description fields above to set its heading and
          subtitle.
        </p>
      </div>
    );
  }

  return null;
}

const hasConfig = (type) =>
  [
    'short_text',
    'long_text',
    'number',
    'rating',
    'date',
    'date_range',
    'checkbox_group',
    'file_upload',
    'section',
  ].includes(type);

// ─── Main card ────────────────────────────────────────────────────────────────
export default function QuestionCard({
  question,
  index,
  total,
  defaultExpanded,
  readOnly,
  parentSection,
  hideMoveButtons,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isRemoving,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [local, setLocal] = useState(question);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Tracks the last successfully saved state so Cancel can revert to it
  const savedRef = useRef(question);

  // Update local state and mark as dirty — NO auto-save
  const update = (updated) => {
    setLocal(updated);
    setDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(question.id, local);
      savedRef.current = local;
      setDirty(false);
    } catch {
      // error snackbar already shown by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocal(savedRef.current);
    setDirty(false);
  };

  const handleOptionChange = (i, locale, val) => {
    const options = local.options.map((opt, idx) =>
      idx === i ? { ...opt, label: { ...opt.label, [locale]: val } } : opt,
    );
    update({ ...local, options });
  };

  const addOption = () => {
    const newIndex = local.options.length;
    update({
      ...local,
      options: [
        ...local.options.map((opt, i) => ({ ...opt, orderIndex: i })),
        {
          orderIndex: newIndex,
          label: { en: `Option ${newIndex + 1}`, ar: `الخيار ${newIndex + 1}` },
        },
      ],
    });
  };

  const removeOption = (i) => {
    if (local.options.length <= 2) return;
    const options = local.options
      .filter((_, idx) => idx !== i)
      .map((opt, idx) => ({ ...opt, orderIndex: idx }));
    update({ ...local, options });
  };

  const titlePreview = local.title?.en || local.title?.ar || '';
  const sectionType = isSection(local.type);

  return (
    <>
      <div
        className={`overflow-hidden rounded-xl border bg-white transition-colors ${sectionType ? 'border-l-4 border-l-tedx-red' : dirty ? 'border-amber-300' : 'border-gray-200'}`}
      >
        {/* ── Header ── */}
        <div
          className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Type badge */}
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${sectionType ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}
          >
            {getTypeLabel(local.type)}
          </span>

          {!sectionType && (
            <span className="shrink-0 text-sm font-medium text-gray-500">Q{index + 1}</span>
          )}

          {/* Parent section badge */}
          {!sectionType && parentSection && (
            <span className="shrink-0 rounded border border-tedx-red px-2 py-0.5 text-xs font-medium text-tedx-red">
              {parentSection.title?.en || parentSection.title?.ar || 'Section'}
            </span>
          )}

          <span className="flex-1 truncate text-sm text-gray-800">
            {titlePreview || <span className="italic text-gray-400">Untitled</span>}
          </span>

          {/* Unsaved dot */}
          {dirty && (
            <span className="shrink-0 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-white">
              Unsaved
            </span>
          )}

          {local.isRequired && !sectionType && !dirty && (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-tedx-red ring-1 ring-red-200">
              Required
            </span>
          )}

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            {/* Discard / Save — only when dirty and not readOnly */}
            {dirty && !readOnly && (
              <>
                <Tooltip title="Discard changes" placement="top">
                  <button
                    onClick={handleDiscard}
                    disabled={isSaving}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-40"
                  >
                    <UndoOutlined style={{ fontSize: 18 }} />
                  </button>
                </Tooltip>
                <Tooltip title="Save this question" placement="top">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-40"
                  >
                    {isSaving ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <CheckOutlined style={{ fontSize: 18 }} />
                    )}
                  </button>
                </Tooltip>
              </>
            )}

            {!hideMoveButtons && (
              <>
                <button
                  onClick={onMoveUp}
                  disabled={readOnly || index === 0}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <KeyboardArrowUp style={{ fontSize: 18 }} />
                </button>
                <button
                  onClick={onMoveDown}
                  disabled={readOnly || index === total - 1}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <KeyboardArrowDown style={{ fontSize: 18 }} />
                </button>
              </>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={readOnly || isRemoving}
              className="rounded p-1 text-red-400 hover:bg-red-50 disabled:opacity-50"
            >
              {isRemoving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <DeleteOutline style={{ fontSize: 18 }} />
              )}
            </button>
          </div>

          <span className="ml-1 shrink-0 text-gray-400">
            {expanded ? (
              <ExpandLess style={{ fontSize: 18 }} />
            ) : (
              <ExpandMore style={{ fontSize: 18 }} />
            )}
          </span>
        </div>

        {/* ── Expanded body ── */}
        {expanded && (
          <div
            className={`space-y-5 border-t border-gray-100 px-4 pb-5 pt-4 ${readOnly ? 'pointer-events-none opacity-60' : ''}`}
          >
            {/* Title / Section heading */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                {sectionType ? 'Section Title' : 'Question Label'}
              </label>
              <LocaleField
                label={sectionType ? 'Section title' : 'Question'}
                value={local.title}
                onChange={(val) => update({ ...local, title: val })}
              />
            </div>

            {/* Help text / Section description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                {sectionType ? 'Section Description' : 'Help Text'}{' '}
                <span className="font-normal normal-case text-gray-300">(optional)</span>
              </label>
              <LocaleField
                label={sectionType ? 'Description' : 'Help text'}
                value={local.helpText}
                onChange={(val) => update({ ...local, helpText: val })}
                multiline
              />
            </div>

            {/* Options (choice types) */}
            {hasOptions(local.type) && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Options
                </label>
                <div className="space-y-2">
                  {local.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red"
                        dir="ltr"
                        value={opt.label?.en ?? ''}
                        onChange={(e) => handleOptionChange(i, 'en', e.target.value)}
                        placeholder="English"
                      />
                      <input
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red"
                        dir="rtl"
                        value={opt.label?.ar ?? ''}
                        onChange={(e) => handleOptionChange(i, 'ar', e.target.value)}
                        placeholder="العربية"
                      />
                      <button
                        onClick={() => removeOption(i)}
                        disabled={local.options.length <= 2}
                        className="rounded p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Close style={{ fontSize: 16 }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addOption}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-tedx-red hover:underline"
                >
                  <Add style={{ fontSize: 14 }} /> Add option
                </button>
              </div>
            )}

            {/* Type-specific config */}
            {hasConfig(local.type) && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Configuration
                </label>
                <ConfigFields
                  type={local.type}
                  config={local.config}
                  onChange={(config) => update({ ...local, config })}
                />
              </div>
            )}

            {/* Required toggle */}
            {!sectionType && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-tedx-red bg-red-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-tedx-red">Required field</p>
                  <p className="text-xs text-red-400">
                    Users must answer this question before submitting.
                  </p>
                </div>
                <Switch
                  checked={local.isRequired}
                  onChange={(e) => update({ ...local, isRequired: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-primary)' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'var(--color-primary)',
                    },
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onRemove(question.id);
        }}
        loading={isRemoving}
        title={sectionType ? 'Delete Section' : 'Delete Question'}
        description={`Are you sure you want to delete ${sectionType ? 'this section' : `Q${index + 1}`}${titlePreview ? ` "${titlePreview}"` : ''}? This cannot be undone.`}
      />
    </>
  );
}
