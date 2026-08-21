import { lazy } from 'react';

const UsersList = lazy(() => import('./users-list/UsersList'));
const User = lazy(() => import('./user-detail/User'));
const MyProfile = lazy(() => import('./profile/MyProfile'));

const UsersAppConfig = {
  routes: [
    {
      path: '/users',
      children: [
        {
          path: '',
          element: <UsersList />,
        },
        {
          path: ':userId',
          element: <User />,
        },
      ],
    },
    {
      path: '/profile',
      element: <MyProfile />,
    },
  ],
};

export default UsersAppConfig;
