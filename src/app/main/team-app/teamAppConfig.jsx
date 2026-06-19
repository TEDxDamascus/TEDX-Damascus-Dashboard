import { lazy } from 'react';

const TeamList = lazy(() => import('./team-list/TeamList'));
const TeamMember = lazy(() => import('./team-details/TeamMember.jsx'));

const TeamAppConfig = {
  routes: [
    {
      path: '/team',
      children: [
        {
          path: '',
          element: <TeamList />,
        },
        {
          path: ':memberId',
          element: <TeamMember />,
        },
      ],
    },
  ],
};

export default TeamAppConfig;
