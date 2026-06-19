import { Box, CircularProgress } from '@mui/material';

function LoadingSpinner({ size = 40 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <CircularProgress size={size} sx={{ color: '#EB0028' }} />
    </Box>
  );
}

export default LoadingSpinner;
