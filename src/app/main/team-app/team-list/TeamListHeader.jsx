import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';

function TeamListHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Breadcrumb items={[{ label: 'Team' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Team Members</h1>
          <p className="mt-1 text-gray-500">Manage your TEDx Damascus team members</p>
        </div>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/team/add')}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          Add New Member
        </Button>
      </div>
    </div>
  );
}

export default TeamListHeader;
