import { useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { selectUser } from '../../auth/store/userSlice';
import { useAuth } from '../../auth/AuthContext';

function Header() {
  const user = useSelector(selectUser);
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'white',
        color: '#1a1a1a',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          <FormattedMessage id="common.dashboard" defaultMessage="Dashboard" />
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.email || 'Admin'}
          </Typography>
          <IconButton onClick={handleLogout} color="inherit" sx={{ mr: 1 }}>
            <Logout />
          </IconButton>
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#EB0028' }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              <FormattedMessage id="common.logout" defaultMessage="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
