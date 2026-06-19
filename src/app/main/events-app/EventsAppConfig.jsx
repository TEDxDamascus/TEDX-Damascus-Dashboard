import { lazy } from 'react';

const EventsList = lazy(() => import('./events-list/EventsList'));
const EventDetail = lazy(() => import('./events-detail/Event'));

const EventsAppConfig = {
  routes: [
    {
      path: '/events',
      children: [
        {
          path: '',
          element: <EventsList />,
        },
        {
          path: ':eventId',
          element: <EventDetail />,
        },
      ],
    },
  ],
};

export default EventsAppConfig;
