import { Tooltip } from '@mui/material';

export default function ToolbarTooltip({ title, children }) {
  if (!title) return children;

  return (
    <Tooltip title={title} placement="top" arrow enterDelay={300}>
      <span className="inline-flex items-center">{children}</span>
    </Tooltip>
  );
}

export function ToolbarButton({ tooltip, active = false, onClick, className = '', children }) {
  const toolbarBtn =
    'rounded border border-gray-200 px-2 py-1 text-sm transition-colors hover:bg-gray-50';

  return (
    <ToolbarTooltip title={tooltip}>
      <button
        type="button"
        onClick={onClick}
        className={[toolbarBtn, active ? 'bg-gray-200' : '', className].filter(Boolean).join(' ')}
      >
        {children}
      </button>
    </ToolbarTooltip>
  );
}
