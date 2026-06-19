import { lazy } from 'react';

const WallList = lazy(() => import('./walls-list/WallList'));
const WallQuestion = lazy(() => import('./wall-question/WallQuestion'));
const BannedWordsPage = lazy(() => import('./banned-words/BannedWordsPage'));

const WallAppConfig = {
  routes: [
    {
      path: '/wall',
      children: [
        {
          path: '',
          element: <WallList />,
        },
        {
          path: 'banned-words',
          element: <BannedWordsPage />,
        },
        {
          path: ':questionId',
          element: <WallQuestion />,
        },
      ],
    },
  ],
};

export default WallAppConfig;
