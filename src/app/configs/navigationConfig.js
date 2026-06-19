import {
  Dashboard,
  Event,
  Forum,
  LabelOutlined,
  People,
  RecordVoiceOver,
  Settings,
} from '@mui/icons-material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupsIcon from '@mui/icons-material/Groups';
const navigationConfig = [
  // {
  //   id: 'dashboard',
  //   title: 'Dashboard',
  //   type: 'item',
  //   icon: Dashboard,
  //   url: '/dashboard',
  // },
  {
    id: 'speakers',
    title: 'Speakers',
    type: 'item',
    icon: RecordVoiceOver,
    url: '/speakers',
  },
  {
    id: 'partners',
    title: 'Partners',
    type: 'item',
    url: '/partners',
  },
  {
    id: 'users',
    title: 'Users',
    type: 'item',
    icon: People,
    url: '/users',
  },
  {
    id: 'team',
    title: 'team',
    type: 'item',
    icon: GroupsIcon,
    url: '/team',
  },
  {
    id: 'organizers',
    title: 'organizers',
    type: 'organizers',
    icon: ManageAccountsIcon,
    url: '/organizers',
  },
  {
    id: 'events',
    title: 'Events',
    type: 'item',
    icon: Event,
    url: '/events',
  },
  {
    id: 'wall',
    title: 'Wall',
    type: 'item',
    icon: Forum,
    url: '/wall',
  },
  {
    id: 'blog',
    title: 'Blog',
    type: 'item',
    url: '/blogs',
  },
  {
    id: 'blog-categories',
    title: 'Blog categories',
    type: 'item',
    icon: LabelOutlined,
    url: '/blogs/categories',
  },
  {
    id: 'settings',
    title: 'Home Settings',
    type: 'item',
    icon: Settings,
    url: '/settings',
  },
];

export default navigationConfig;
