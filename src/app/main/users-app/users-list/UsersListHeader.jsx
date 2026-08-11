import { Button, Tabs, Tab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../shared-components/breadcrumb';

function UsersListHeader({ roleTab, onRoleTabChange }) {
  const navigate = useNavigate();
  const isAdmins = roleTab === 'admin';

  return (
    <div className="mb-6">
      <Breadcrumb items={[{ label: 'Users' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">Users</h1>
          <p className="mt-1 text-gray-500">Manage TEDx Damascus users and admins</p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate(`/users/add?role=${roleTab}`)}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          {isAdmins ? 'Add New Admin' : 'Add New User'}
        </Button>
      </div>

      <Tabs
        value={roleTab}
        onChange={(_, value) => onRoleTabChange(value)}
        sx={{
          mt: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root.Mui-selected': { color: 'var(--color-primary)' },
          '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' },
        }}
      >
        <Tab label="Users" value="user" />
        <Tab label="Admins" value="admin" />
      </Tabs>
    </div>
  );
}

export default UsersListHeader;
