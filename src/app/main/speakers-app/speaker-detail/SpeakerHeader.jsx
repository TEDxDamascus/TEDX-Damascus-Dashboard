import { Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function SpeakerHeader({ onSave, isNew, isSaving }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-2xl font-bold text-tedx-dark">
        {isNew ? 'Add New Speaker' : 'Edit Speaker'}
      </h1>
      <div className="flex gap-2">
        <Button
          variant="outlined"
          onClick={() => navigate('/speakers')}
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
          {isSaving ? 'Saving...' : 'Save Speaker'}
        </Button>
      </div>
    </div>
  );
}

export default SpeakerHeader;
