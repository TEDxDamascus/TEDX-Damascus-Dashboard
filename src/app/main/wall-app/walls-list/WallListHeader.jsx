import { Button } from '@mui/material';
import { Add, Block } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';

function WallListHeader() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Breadcrumb items={[{ label: 'Wall' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Wall</h1>
          <p className="mt-1 text-gray-500">Manage audience questions and answers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            component={Link}
            to="/wall/banned-words"
            variant="outlined"
            startIcon={<Block style={{ fontSize: 16 }} />}
            sx={{ borderColor: '#e0e0e0', color: '#666' }}
          >
            Banned Words
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/wall/add')}
            sx={{
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            New Question
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WallListHeader;
