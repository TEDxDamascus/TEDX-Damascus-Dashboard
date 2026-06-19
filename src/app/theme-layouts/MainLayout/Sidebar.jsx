import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Event,
  ChevronLeft,
  RecordVoiceOver,
  Menu,
  Assignment,
  Article,
  LabelOutlined,
  Handshake,
  Forum,
  Settings,
} from '@mui/icons-material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupsIcon from '@mui/icons-material/Groups';
const drawerWidth = 260;

const menuItems = [
  // { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Speakers', icon: <RecordVoiceOver />, path: '/speakers' },
  { text: 'Partners', icon: <Handshake />, path: '/partners' },
  // { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Team', icon: <GroupsIcon />, path: '/team' },
  { text: 'Organizers', icon: <ManageAccountsIcon />, path: '/organizers' },
  { text: 'Forms', icon: <Assignment />, path: '/forms' },
  { text: 'Events', icon: <Event />, path: '/events' },
  // { text: 'Wall', icon: <Forum />, path: '/wall' },
  { text: 'Blog', icon: <Article />, path: '/blogs' },
  { text: 'Blog categories', icon: <LabelOutlined />, path: '/blogs/categories' },
  // { text: 'Home Settings', icon: <Settings />, path: '/settings' },
];

function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          transition: 'width 0.3s',
          overflowX: 'hidden',
          backgroundColor: '#1a1a1a',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#EB0028' }}>
            TEDx Damascus
          </Typography>
        )}
        <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
          {open ? <ChevronLeft /> : <Menu />}
        </IconButton>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => {
          const isSelected =
            item.path === '/blogs/categories'
              ? location.pathname.startsWith('/blogs/categories')
              : item.path === '/blogs'
                ? location.pathname.startsWith('/blogs') &&
                  !location.pathname.startsWith('/blogs/categories')
                : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
              <Tooltip title={open ? '' : item.text} placement="right" arrow>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: '#EB0028',
                      '&:hover': { backgroundColor: '#C00020' },
                    },
                    '&:hover': { backgroundColor: 'rgba(235, 0, 40, 0.1)' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
