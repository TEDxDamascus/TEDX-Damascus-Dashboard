import { lazy } from 'react';

const SpeakersList = lazy(() => import('./speakers-list/SpeakersList'));
const Speaker = lazy(() => import('./speaker-detail/Speaker'));

const SpeakersAppConfig = {
  routes: [
    {
      path: '/speakers',
      children: [
        {
          path: '',
          element: <SpeakersList />,
        },
        {
          path: ':speakerId',
          element: <Speaker />,
        },
      ],
    },
  ],
};

export default SpeakersAppConfig;
