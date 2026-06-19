import { useState } from 'react';
import { Image } from '@mui/icons-material';
import ImagePickerDialog from './ImagePickerDialog';
import { mediaFormValueToPreviewSrc, normalizeMediaFormValue } from './mediaRefUtils';

/**
 * @param {'url' | 'mediaRef'} valueMode
 *   `url` (default): form stores a single URL string (events, legacy).
 *   `mediaRef`: form stores `{ id, url }` with Mongo id for APIs that expect `blog_image` as ObjectId.
 */
export default function ImagePickerField({
  value,
  onChange,
  valueMode = 'url',
  label = 'Image',
  required,
  error,
  helperText,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  const previewSrc =
    valueMode === 'mediaRef'
      ? mediaFormValueToPreviewSrc(value)
      : typeof value === 'string'
        ? value
        : mediaFormValueToPreviewSrc(value);

  const hasValue = Boolean((previewSrc || '').trim());

  const handleDialogSelect = (ref) => {
    if (valueMode === 'mediaRef') {
      const { id, url } = normalizeMediaFormValue(ref);
      onChange?.({ id, url });
    } else {
      const { url, id } = normalizeMediaFormValue(ref);
      onChange?.(url || id || '');
    }
  };

  return (
    <>
      {required && (
        <p className="mb-1 text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </p>
      )}
      <div className="flex items-stretch gap-3">
        {/* Thumbnail */}
        <div className="flex w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">
          {hasValue ? (
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <Image className="text-gray-300" style={{ fontSize: 24 }} />
          )}
        </div>

        {/* Input */}
        <div className="flex-1">
          <div
            className={[
              'flex items-center overflow-hidden rounded border bg-white',
              error ? 'border-red-500' : 'border-gray-300',
              disabled ? 'opacity-70' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="text"
              value={
                valueMode === 'mediaRef'
                  ? normalizeMediaFormValue(value).url || normalizeMediaFormValue(value).id || ''
                  : typeof value === 'string'
                    ? (value ?? '')
                    : mediaFormValueToPreviewSrc(value)
              }
              onChange={(e) => {
                const t = e.target.value;
                if (valueMode === 'mediaRef') {
                  onChange?.({ id: '', url: t });
                } else {
                  onChange?.(t);
                }
              }}
              disabled={disabled || hasValue}
              placeholder={label}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none disabled:cursor-default"
            />

            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={disabled}
              className="border-l border-gray-200 px-3 py-2 text-xs font-semibold text-tedx-red transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {hasValue ? 'Change' : 'Browse'}
            </button>
          </div>

          {helperText && (
            <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-400'}`}>
              {helperText}
            </p>
          )}
        </div>
      </div>

      <ImagePickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={handleDialogSelect}
        currentValue={value}
      />
    </>
  );
}
