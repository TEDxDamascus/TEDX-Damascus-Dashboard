import { useEffect, useState } from 'react';
import { Button, CircularProgress, MenuItem, Paper, Select, Switch, Tooltip } from '@mui/material';
import {
  Save,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ExpandMore,
  ExpandLess,
  VisibilityOutlined,
  VisibilityOffOutlined,
  Add,
  DeleteOutline,
  Close,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useGetHomeSettingsQuery, useUpdateHomeSettingsMutation } from '../HomeSettingsApi';

// ── Section catalog ───────────────────────────────────────────────────────────
// All known section types. Used to populate the "Add Section" picker.
const SECTION_CATALOG = {
  hero: {
    label: 'Hero',
    description: 'Main banner / hero at the top of the page',
    defaultSettings: { variant: 'main' },
  },
  blogs: {
    label: 'Blogs',
    description: 'Latest blog posts grid',
    defaultSettings: { limit: 3, status: 'published' },
  },
  speakers: {
    label: 'Speakers',
    description: 'Featured speakers showcase',
    defaultSettings: { limit: 6 },
  },
  partners: {
    label: 'Partners',
    description: 'Partner logos strip',
    defaultSettings: {},
  },
  about: {
    label: 'About TEDx',
    description: 'About TEDx section with description text',
    defaultSettings: {},
  },
  events: {
    label: 'Events',
    description: 'Upcoming and past events',
    defaultSettings: { limit: 3 },
  },
  call_for_voices: {
    label: 'Call for Voices',
    description: 'Speaker application call-to-action',
    defaultSettings: {},
  },
  gallery: {
    label: 'Gallery',
    description: 'Photo / media gallery',
    defaultSettings: { limit: 9 },
  },
};

// ── Data helpers ──────────────────────────────────────────────────────────────
function toArray(sections = {}) {
  return Object.entries(sections)
    .map(([key, val]) => ({ key, ...val, settings: val.settings ?? {} }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function toApiPayload(arr) {
  const sections = {};
  arr.forEach((s, i) => {
    const { key, ...rest } = s;
    sections[key] = { ...rest, order: i + 1 };
  });
  return { sections };
}

// ── Section-specific settings fields ─────────────────────────────────────────
function SectionSettings({ sectionKey, settings, onChange }) {
  const update = (field, val) => onChange({ ...settings, [field]: val });

  const inputCls =
    'w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red';

  if (sectionKey === 'hero') {
    return (
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Variant</label>
        <Select
          size="small"
          value={settings.variant ?? 'main'}
          onChange={(e) => update('variant', e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="main">Main</MenuItem>
          <MenuItem value="secondary">Secondary</MenuItem>
          <MenuItem value="minimal">Minimal</MenuItem>
        </Select>
      </div>
    );
  }

  if (sectionKey === 'blogs') {
    return (
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Limit</label>
          <input
            type="number"
            min={1}
            max={12}
            value={settings.limit ?? 3}
            onChange={(e) => update('limit', Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Status</label>
          <Select
            size="small"
            value={settings.status ?? 'published'}
            onChange={(e) => update('status', e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </div>
      </div>
    );
  }

  if (sectionKey === 'speakers') {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Limit</label>
        <input
          type="number"
          min={1}
          max={24}
          value={settings.limit ?? 6}
          onChange={(e) => update('limit', Number(e.target.value))}
          className={inputCls}
        />
      </div>
    );
  }

  if (sectionKey === 'events' || sectionKey === 'gallery') {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Limit</label>
        <input
          type="number"
          min={1}
          max={24}
          value={settings.limit ?? 3}
          onChange={(e) => update('limit', Number(e.target.value))}
          className={inputCls}
        />
      </div>
    );
  }

  return <p className="text-sm italic text-gray-400">No configurable settings for this section.</p>;
}

// ── SectionCard ───────────────────────────────────────────────────────────────
function SectionCard({ section, index, total, onChange, onMoveUp, onMoveDown, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const meta = SECTION_CATALOG[section.key] ?? {
    label: section.key,
    description: '',
    defaultSettings: {},
  };
  const hasSettings = ['hero', 'blogs', 'speakers', 'events', 'gallery'].includes(section.key);

  return (
    <div
      className={[
        'overflow-hidden rounded-xl border bg-white transition-all',
        section.isVisible ? 'border-gray-200' : 'border-dashed border-gray-200',
        !section.isVisible ? 'opacity-60' : '',
      ].join(' ')}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Order badge */}
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
          {index + 1}
        </span>

        {/* Label + description */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800">{meta.label}</p>
          <p className="truncate text-xs text-gray-400">{meta.description}</p>
        </div>

        {/* Visibility toggle */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip title={section.isVisible ? 'Visible' : 'Hidden'} placement="top">
            <span className={section.isVisible ? 'text-green-500' : 'text-gray-400'}>
              {section.isVisible ? (
                <VisibilityOutlined style={{ fontSize: 16 }} />
              ) : (
                <VisibilityOffOutlined style={{ fontSize: 16 }} />
              )}
            </span>
          </Tooltip>
          <Switch
            size="small"
            checked={section.isVisible}
            onChange={(e) => onChange({ ...section, isVisible: e.target.checked })}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-primary)' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'var(--color-primary)',
              },
            }}
          />
        </div>

        {/* Up / Down */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            <KeyboardArrowUp style={{ fontSize: 18 }} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            <KeyboardArrowDown style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Settings expand (only if configurable) */}
        {hasSettings && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
          >
            {expanded ? (
              <ExpandLess style={{ fontSize: 18 }} />
            ) : (
              <ExpandMore style={{ fontSize: 18 }} />
            )}
          </button>
        )}

        {/* Remove */}
        <Tooltip title="Remove section" placement="top">
          <button onClick={onRemove} className="rounded p-1 text-red-400 hover:bg-red-50">
            <DeleteOutline style={{ fontSize: 18 }} />
          </button>
        </Tooltip>
      </div>

      {/* Settings panel */}
      {expanded && hasSettings && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <SectionSettings
            sectionKey={section.key}
            settings={section.settings}
            onChange={(newSettings) => onChange({ ...section, settings: newSettings })}
          />
        </div>
      )}
    </div>
  );
}

// ── Add Section Picker ────────────────────────────────────────────────────────
function AddSectionPanel({ existingKeys, onAdd, onClose }) {
  const available = Object.entries(SECTION_CATALOG).filter(([key]) => !existingKeys.includes(key));

  if (available.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">All available sections have been added.</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Close style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-tedx-red bg-red-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Choose a section to add</p>
        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
          <Close style={{ fontSize: 18 }} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {available.map(([key, meta]) => (
          <button
            key={key}
            onClick={() => onAdd(key, meta)}
            className="flex flex-col items-start gap-1 rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:border-tedx-red hover:bg-white"
          >
            <span className="text-xs font-semibold text-gray-800">{meta.label}</span>
            <span className="text-xs text-gray-400">{meta.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomeSettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading } = useGetHomeSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateHomeSettingsMutation();

  const [sections, setSections] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (data?.sections) {
      setSections(toArray(data.sections));
    }
  }, [data]);

  const handleChange = (index, updated) =>
    setSections((prev) => prev.map((s, i) => (i === index ? updated : s)));

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index) => {
    setSections((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleRemove = (index) => setSections((prev) => prev.filter((_, i) => i !== index));

  const handleAdd = (key, meta) => {
    setSections((prev) => [
      ...prev,
      {
        key,
        isVisible: true,
        order: prev.length + 1,
        settings: { ...meta.defaultSettings },
      },
    ]);
    setShowPicker(false);
  };

  const handleSave = async () => {
    try {
      await updateSettings({ id: data?.id, data: toApiPayload(sections) }).unwrap();
      enqueueSnackbar('Settings saved successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to save settings', { variant: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const existingKeys = sections.map((s) => s.key);

  return (
    <div className="flex-1 overflow-y-auto p-6 pt-8">
      <Breadcrumb items={[{ label: 'Home Settings' }]} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Home Settings</h1>
          <p className="mt-1 text-gray-500">
            Control which sections appear on the homepage and in what order.
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          {isSaving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>

      <Paper
        elevation={0}
        sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Sections
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-400">
              {sections.length}
            </span>
          </p>
        </div>

        <div className="space-y-3 p-4">
          {/* Section cards */}
          {sections.length === 0 && !showPicker && (
            <div className="flex flex-col items-center py-10 text-gray-400">
              <p className="text-sm">No sections added yet.</p>
              <p className="text-xs">Click &ldquo;Add Section&rdquo; below to get started.</p>
            </div>
          )}

          {sections.map((section, i) => (
            <SectionCard
              key={section.key}
              section={section}
              index={i}
              total={sections.length}
              onChange={(updated) => handleChange(i, updated)}
              onMoveUp={() => handleMoveUp(i)}
              onMoveDown={() => handleMoveDown(i)}
              onRemove={() => handleRemove(i)}
            />
          ))}

          {/* Add Section picker / button */}
          {showPicker ? (
            <AddSectionPanel
              existingKeys={existingKeys}
              onAdd={handleAdd}
              onClose={() => setShowPicker(false)}
            />
          ) : (
            <button
              onClick={() => setShowPicker(true)}
              disabled={existingKeys.length === Object.keys(SECTION_CATALOG).length}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-tedx-red hover:text-tedx-red disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Add style={{ fontSize: 18 }} />
              Add Section
            </button>
          )}
        </div>
      </Paper>
    </div>
  );
}
