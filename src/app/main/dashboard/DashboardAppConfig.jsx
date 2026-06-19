import { lazy } from 'react';
import DashboardPage from './DashboardPage';

const HomeSettingsPage = lazy(() => import('../home-settings-app/home-settings/HomeSettingsPage'));

const DashboardAppConfig = {
  routes: [
    {
      path: '/dashboard',
      element: <DashboardPage />,
    },
    {
      path: '/settings',
      children: [
        {
          path: '',
          element: <HomeSettingsPage />,
        },
      ],
    },
  ],
};

export default DashboardAppConfig;
