import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';

function FormsListHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Breadcrumb items={[{ label: 'Forms' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Forms</h1>
          <p className="mt-1 text-gray-500">
            Manage application forms for speakers, attendees, and more
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/forms/add')}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          Create Form
        </Button>
      </div>
    </div>
  );
}

export default FormsListHeader;
