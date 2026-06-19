import { Button, Typography, Box } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function EventHeader({ onSave, isNew, isSaving }) {
  const navigate = useNavigate();

  return (
    <Box
      className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4"
      sx={{ mb: 3 }}
    >
      <Typography variant="h5" className="font-bold text-tedx-dark">
        {isNew ? 'Add New Event' : 'Edit Event'}
      </Typography>

      <div className="flex gap-2">
        <Button
          variant="outlined"
          onClick={() => navigate('/events')}
          sx={{ borderColor: '#e0e0e0', color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={onSave}
          disabled={isSaving}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Event'}
        </Button>
      </div>
    </Box>
  );
}

export default EventHeader;
