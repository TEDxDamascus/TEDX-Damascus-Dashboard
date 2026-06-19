const STATUS_MAP = {
  published: { label: 'Published', className: 'bg-green-100 text-green-700 border-green-200' },
  draft: { label: 'Draft', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactive', className: 'bg-red-100 text-red-600 border-red-200' },
  disabled: { label: 'Disabled', className: 'bg-red-100 text-red-600 border-red-200' },
  pending: { label: 'Pending', className: 'bg-blue-100 text-blue-600 border-blue-200' },
  featured: { label: 'Featured', className: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function StatusBadge({ status, label: overrideLabel, className: extra = '' }) {
  const normalized = status?.toLowerCase() ?? '';
  const config = STATUS_MAP[normalized] ?? {
    label: status ?? 'Unknown',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        extra,
      ].join(' ')}
    >
      {overrideLabel ?? config.label}
    </span>
  );
}
