import { useState, useRef } from 'react';
import {
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  Search,
  DeleteOutline,
  TableRows,
} from '@mui/icons-material';
import { useTableState } from './useTableState';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function SortIcon({ column, sortBy, sortDir }) {
  if (!column.sortable) return null;
  if (sortBy !== column.id)
    return <UnfoldMore className="text-gray-400" style={{ fontSize: 16 }} />;
  return sortDir === 'asc' ? (
    <ArrowUpward className="text-tedx-red" style={{ fontSize: 16 }} />
  ) : (
    <ArrowDownward className="text-tedx-red" style={{ fontSize: 16 }} />
  );
}

function TableToolbar({
  localSearch,
  onSearchChange,
  selectedIds,
  onBulkDelete,
  bulkDeleteLabel,
  bulkActions,
  rightAction,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
      <div className="relative max-w-xs flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          style={{ fontSize: 18 }}
        />
        <input
          type="text"
          value={localSearch}
          onChange={onSearchChange}
          placeholder="Search..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-tedx-red"
        />
      </div>

      {selectedIds.length > 0 && (
        <>
          {bulkActions?.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
          {onBulkDelete && (
            <button
              onClick={() => onBulkDelete(selectedIds)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <DeleteOutline style={{ fontSize: 16 }} />
              {bulkDeleteLabel ?? `Delete (${selectedIds.length})`}
            </button>
          )}
        </>
      )}

      {rightAction && <div className="ml-auto">{rightAction}</div>}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <tr>
      <td colSpan={999}>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <TableRows style={{ fontSize: 48 }} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
}

function SkeletonRows({ columns, rowCount, hasActions, hasBulk }) {
  return Array.from({ length: rowCount }).map((_, i) => (
    <tr key={i} className="border-b border-gray-100">
      {hasBulk && (
        <td className="px-4 py-3">
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
        </td>
      )}
      {columns.map((col) => (
        <td key={col.id} className="px-4 py-3">
          <div
            className="h-4 animate-pulse rounded bg-gray-200"
            style={{ width: col.skeletonWidth ?? '60%' }}
          />
        </td>
      ))}
      {hasActions && (
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
          </div>
        </td>
      )}
    </tr>
  ));
}

function Pagination({ page, pageSize, totalCount, setPage, setPageSize }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tedx-red"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="ml-2">
          {from}–{to} of {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <PageButton onClick={() => setPage(1)} disabled={page === 1}>
          «
        </PageButton>
        <PageButton onClick={() => setPage(page - 1)} disabled={page === 1}>
          ‹
        </PageButton>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <PageButton key={p} onClick={() => setPage(p)} active={p === page}>
              {p}
            </PageButton>
          ),
        )}
        <PageButton onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          ›
        </PageButton>
        <PageButton onClick={() => setPage(totalPages)} disabled={page === totalPages}>
          »
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex h-8 w-8 items-center justify-center rounded text-sm transition-colors',
        active ? 'bg-tedx-red font-semibold text-white' : 'text-gray-600 hover:bg-gray-100',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

export default function CustomTable({
  tableId,
  columns,
  data = [],
  totalCount = 0,
  isLoading = false,
  rowActions,
  onBulkDelete,
  onRowClick,
  getRowId = (row) => row.id,
  emptyMessage = 'No results found.',
  bulkDeleteLabel,
  bulkActions,
  selectedIds: externalSelectedIds,
  onSelectChange: externalOnSelectChange,
  rightAction,
}) {
  const { params, setPage, setPageSize, setSearch, setSort } = useTableState(tableId);
  const { page, pageSize, sortBy, sortDir } = params;

  const safeData = Array.isArray(data) ? data : [];

  const [internalSelectedIds, setInternalSelectedIds] = useState([]);
  const selectedIds = externalSelectedIds ?? internalSelectedIds;
  const setSelectedIds = externalOnSelectChange
    ? (idsOrFn) => {
        if (typeof idsOrFn === 'function') {
          externalOnSelectChange(idsOrFn);
        } else {
          externalOnSelectChange(idsOrFn);
        }
      }
    : setInternalSelectedIds;
  const [localSearch, setLocalSearch] = useState(params.search);
  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 400);
  };

  const handleSortClick = (col) => {
    if (!col.sortable) return;
    if (sortBy === col.id) {
      setSort(col.id, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(col.id, 'asc');
    }
  };

  const allIds = safeData.map(getRowId);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : allIds);
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const hasBulk = !!onBulkDelete;
  const hasActions = !!rowActions;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <TableToolbar
        localSearch={localSearch}
        onSearchChange={handleSearchChange}
        selectedIds={selectedIds}
        onBulkDelete={onBulkDelete}
        bulkDeleteLabel={bulkDeleteLabel}
        bulkActions={bulkActions}
        rightAction={rightAction}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {hasBulk && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer accent-tedx-red"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  onClick={() => handleSortClick(col)}
                  className={[
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500',
                    col.sortable ? 'cursor-pointer select-none hover:text-tedx-dark' : '',
                    col.headerClassName ?? '',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    <SortIcon column={col} sortBy={sortBy} sortDir={sortDir} />
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <SkeletonRows
                columns={columns}
                rowCount={pageSize}
                hasActions={hasActions}
                hasBulk={hasBulk}
              />
            ) : safeData.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              safeData.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.includes(rowId);
                const actions = rowActions?.(row) ?? [];

                return (
                  <tr
                    key={rowId}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      'border-b border-gray-100 transition-colors',
                      isSelected ? 'bg-red-50' : 'hover:bg-gray-50',
                      onRowClick ? 'cursor-pointer hover:bg-red-50/40' : '',
                    ].join(' ')}
                  >
                    {hasBulk && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowId)}
                          className="h-4 w-4 cursor-pointer accent-tedx-red"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={`px-4 py-3 text-sm text-gray-700 ${col.cellClassName ?? ''}`}
                      >
                        {col.renderCell
                          ? col.renderCell(row[col.id], row, {
                              selectedIds,
                              onSelectChange: setSelectedIds,
                            })
                          : (row[col.id] ?? '—')}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-start gap-1">
                          {actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); action.onClick?.(e); }}
                              title={action.title || action.label}
                              disabled={action.disabled}
                              className={[
                                'rounded-lg p-1.5 transition-colors',
                                action.danger
                                  ? 'text-red-500 hover:bg-red-50'
                                  : 'text-gray-500 hover:bg-gray-100',
                                action.disabled ? 'cursor-not-allowed opacity-40' : '',
                              ].join(' ')}
                            >
                              {action.icon}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    </div>
  );
}
