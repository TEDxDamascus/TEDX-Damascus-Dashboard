import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { DeleteOutline, CheckCircleOutline } from '@mui/icons-material';

const VARIANTS = {
  danger: {
    label: 'Delete',
    loadingLabel: 'Deleting…',
    icon: <DeleteOutline />,
    className: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    label: 'Confirm',
    loadingLabel: 'Processing…',
    icon: <CheckCircleOutline />,
    className: 'bg-amber-500 hover:bg-amber-600 text-white',
  },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirm',
  description = 'Are you sure?',
  confirmLabel,
  variant = 'danger',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.danger;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions className="gap-2 px-6 pb-4">
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : v.icon}
          className={v.className}
        >
          {loading ? v.loadingLabel : (confirmLabel ?? v.label)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
