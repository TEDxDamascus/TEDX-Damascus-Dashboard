import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Grid,
  Skeleton,
  Pagination,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Check, Close, CloudUpload, DeleteOutline } from '@mui/icons-material';
import {
  useGetMediaItemsQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
} from '../../main/storage/StorageApi';
import ConfirmModal from '../confirm-modal';
import { mediaSelectionMatches, toDisplayImageUrl } from './mediaRefUtils';

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageCard({ item, currentValue, onSelect, onDelete }) {
  const isActive = mediaSelectionMatches(currentValue, item);

  return (
    <div
      onClick={() =>
        onSelect({
          id: String(item._id ?? item.id ?? '').trim(),
          url: String(item.url ?? '').trim(),
        })
      }
      className={[
        'group relative cursor-pointer overflow-hidden rounded',
        'aspect-square bg-gray-100',
        isActive ? 'ring-2 ring-tedx-red' : 'ring-2 ring-transparent hover:ring-tedx-red',
      ].join(' ')}
    >
      <img
        src={toDisplayImageUrl(item.url)}
        alt={item.basename}
        loading="lazy"
        className="h-full w-full object-cover"
      />

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-black/55 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
      >
        <DeleteOutline style={{ fontSize: 14, color: 'white' }} />
      </button>

      {/* Selected check */}
      {isActive && (
        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-tedx-red">
          <Check style={{ fontSize: 13, color: 'white' }} />
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-1">
        <p className="truncate text-xs text-white">{item.basename}</p>
        <p className="text-xs text-white/65">{formatBytes(item.size)}</p>
      </div>
    </div>
  );
}

function LibraryTab({ currentValue, onSelect }) {
  const [page, setPage] = useState(1);
  const [confirmItem, setConfirmItem] = useState(null);
  const { data, isLoading, isFetching } = useGetMediaItemsQuery({ page, limit: 20 });
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  const items = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const handleDeleteConfirm = async () => {
    if (!confirmItem) return;
    const mid = String(confirmItem.id ?? confirmItem._id ?? '').trim();
    if (!mid) {
      setConfirmItem(null);
      return;
    }
    try {
      await deleteMedia(mid).unwrap();
      if (mediaSelectionMatches(currentValue, confirmItem)) onSelect({ id: '', url: '' });
    } catch {
      /* backend error — modal closes; optional: toast */
    } finally {
      setConfirmItem(null);
    }
  };

  if (isLoading) {
    return (
      <Grid container spacing={1.5}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid item xs={6} sm={4} md={3} key={i}>
            <Skeleton variant="rectangular" className="aspect-square rounded" />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!items.length) {
    return <div className="py-16 text-center text-sm text-gray-400">No images uploaded yet.</div>;
  }

  return (
    <>
      <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <Grid container spacing={1.5}>
          {items.map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item.id}>
              <ImageCard
                item={item}
                currentValue={currentValue}
                onSelect={onSelect}
                onDelete={setConfirmItem}
              />
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              sx={{
                '& .Mui-selected': { bgcolor: 'var(--color-primary) !important', color: 'white' },
              }}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Image"
        description={`Are you sure you want to delete "${confirmItem?.basename}"? This action cannot be undone.`}
      />
    </>
  );
}

function UploadTab({ onFileSelect, preview }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f?.type.startsWith('image/')) onFileSelect(f);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 p-4 transition-colors hover:border-tedx-red hover:bg-red-50"
    >
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleChange} />
      {preview ? (
        <img
          src={preview}
          alt="preview"
          className="max-h-[260px] w-full rounded-lg object-contain"
        />
      ) : (
        <>
          <CloudUpload className="mb-3 text-gray-300" style={{ fontSize: 52 }} />
          <p className="text-sm font-medium text-gray-500">Click or drag an image here</p>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP — up to 10 MB</p>
        </>
      )}
    </div>
  );
}

export default function ImagePickerDialog({ open, onClose, onSelect, currentValue }) {
  const [tab, setTab] = useState(0);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState('');
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  useEffect(() => {
    if (!open) {
      setPendingFile(null);
      setPendingPreview('');
      setTab(0);
    }
  }, [open]);

  const handleFileSelect = (file) => {
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const handleLibrarySelect = (ref) => {
    onSelect(ref);
    onClose();
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    const formData = new FormData();
    formData.append('file', pendingFile);
    try {
      const body = await uploadMedia(formData).unwrap();
      const d = body?.data ?? body ?? {};
      const id = String(d._id ?? d.id ?? '').trim();
      const url = String(d.url ?? '').trim();
      if (id || url) {
        onSelect({ id, url });
        onClose();
      }
    } catch {
      // Error surfaced by RTK / global handlers if wired; keep dialog open for retry.
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between pb-2">
        <span className="text-lg font-semibold text-tedx-dark">Media Library</span>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <div className="border-b border-gray-200 px-6">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root.Mui-selected': { color: 'var(--color-primary)' },
            '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)' },
          }}
        >
          <Tab label="Library" />
          <Tab label="Upload New" />
        </Tabs>
      </div>

      <DialogContent className="min-h-[360px]">
        {tab === 0 && <LibraryTab currentValue={currentValue} onSelect={handleLibrarySelect} />}
        {tab === 1 && <UploadTab onFileSelect={handleFileSelect} preview={pendingPreview} />}
      </DialogContent>

      <DialogActions className="gap-2 border-t border-gray-200 px-6 py-3">
        {tab === 1 && pendingFile && (
          <p className="mr-auto truncate text-xs text-gray-400">
            {pendingFile.name} — {formatBytes(pendingFile.size)}
          </p>
        )}
        <Button onClick={onClose} className="flex-shrink-0">
          Cancel
        </Button>
        {tab === 1 && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!pendingFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={14} color="inherit" /> : null}
            className="flex-shrink-0"
            sx={{
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }}
          >
            {isUploading ? 'Uploading…' : 'Upload Image'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
