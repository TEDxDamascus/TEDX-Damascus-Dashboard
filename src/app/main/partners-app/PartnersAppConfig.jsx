import { lazy } from 'react';

const PartnersList = lazy(() => import('./partners-list/PartnersList'));
const Partner = lazy(() => import('./partners-details/Partner'));

const PartnersAppConfig = {
  routes: [
    {
      path: '/partners',
      children: [
        {
          path: '',
          element: <PartnersList />,
        },
        {
          path: ':partnerId',
          element: <Partner />,
        },
      ],
    },
  ],
};

export default PartnersAppConfig;
