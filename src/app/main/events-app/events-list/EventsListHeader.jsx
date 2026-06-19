import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';

function EventsListHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Breadcrumb items={[{ label: 'Events' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Events</h1>
          <p className="mt-1 text-gray-500">Manage your TEDxDamascus events</p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/events/add')}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          Add New Event
        </Button>
      </div>
    </div>
  );
}

export default EventsListHeader;
