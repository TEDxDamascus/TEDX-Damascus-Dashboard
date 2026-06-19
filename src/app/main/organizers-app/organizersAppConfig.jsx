import { lazy } from 'react';
const OrganizersList = lazy(() => import('./organizers-list/organizersList'));
const Organizer = lazy(() => import('./organizer-detail/organizer'));

const organizersAppConfig = {
  routes: [
    {
      path: '/organizers',
      children: [
        {
          path: '',
          element: <OrganizersList />,
        },
        {
          path: ':organizerId',
          element: <Organizer />,
        },
      ],
    },
  ],
};

export default organizersAppConfig;
