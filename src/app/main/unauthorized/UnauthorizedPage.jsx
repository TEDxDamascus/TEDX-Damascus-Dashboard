import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '5rem', fontWeight: 700, color: '#EB0028' }}>
        403
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ color: '#666', maxWidth: 400 }}>
        Your account does not have permission to access the TEDx Damascus dashboard. Only
        administrators can sign in here.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={logout}
          sx={{ backgroundColor: '#EB0028', '&:hover': { backgroundColor: '#C00020' } }}
        >
          Sign Out
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
}

export default UnauthorizedPage;
