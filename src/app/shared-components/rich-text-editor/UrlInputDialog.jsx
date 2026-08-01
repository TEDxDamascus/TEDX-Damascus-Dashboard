import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

export default function UrlInputDialog({
  open,
  onClose,
  onSubmit,
  title = 'إدخال الرابط',
  description = '',
  initialValue = '',
  placeholder = 'https://example.com',
  submitLabel = 'إدراج',
  fieldLabel = 'الرابط',
  helperText = 'يفتح الرابط في تبويب جديد للقرّاء.',
  cancelLabel = 'إلغاء',
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open) return;
    setValue(initialValue);
  }, [open, initialValue]);

  const handleSubmit = () => {
    const trimmed = value.trim();

    if (!trimmed) {
      onSubmit('');
      onClose();
      return;
    }

    onSubmit(trimmed);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth dir="rtl">
      <DialogTitle className="flex items-center justify-between pb-2">
        <span className="text-lg font-semibold text-tedx-dark">{title}</span>
        <IconButton onClick={onClose} size="small" aria-label="إغلاق" sx={{ ml: 0, mr: -1 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="pt-1">
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        ) : null}

        <TextField
          autoFocus
          fullWidth
          label={fieldLabel}
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          helperText={helperText}
          dir="ltr"
          inputProps={{ dir: 'ltr', style: { textAlign: 'left' } }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
      </DialogContent>

      <DialogActions className="gap-2 border-t border-gray-200 px-6 py-3">
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: 'var(--color-primary)',
            '&:hover': { bgcolor: 'var(--color-primary-dark)' },
          }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
