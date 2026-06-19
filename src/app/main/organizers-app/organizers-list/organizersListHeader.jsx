import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';

function OrganizersListHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Breadcrumb items={[{ label: 'organizers' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">organizers</h1>
          <p className="mt-1 text-gray-500">TEDx Damascus Organizing Team Management</p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/organizers/add')}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          Add New organizer
        </Button>
      </div>
    </div>
  );
}

export default OrganizersListHeader;
