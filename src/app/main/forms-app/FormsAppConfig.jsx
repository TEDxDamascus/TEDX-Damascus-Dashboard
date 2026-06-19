import { lazy } from 'react';

const FormsList = lazy(() => import('./forms-list/FormsList'));
const FormBuilder = lazy(() => import('./form-builder/FormBuilder'));
const FormSubmissions = lazy(() => import('./form-submissions/FormSubmissions'));
const FormSubmissionDetail = lazy(() => import('./form-submissions/FormSubmissionDetail'));

const FormsAppConfig = {
  routes: [
    {
      path: '/forms',
      children: [
        {
          path: '',
          element: <FormsList />,
        },
        {
          path: ':formId',
          element: <FormBuilder />,
        },
        {
          path: ':formId/submissions',
          element: <FormSubmissions />,
        },
        {
          path: ':formId/submissions/:submissionId',
          element: <FormSubmissionDetail />,
        },
      ],
    },
  ],
};

export default FormsAppConfig;
