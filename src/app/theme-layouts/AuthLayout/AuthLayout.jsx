import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Outlet />
    </Box>
  );
}

export default AuthLayout;
