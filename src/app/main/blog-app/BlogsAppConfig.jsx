import { lazy } from 'react';

const BlogsList = lazy(() => import('./blogs-list/BlogsList'));
const BlogCategoriesList = lazy(() => import('./blog-categories/BlogCategoriesList'));
const BlogCategory = lazy(() => import('./blog-categories/BlogCategory'));
const Blog = lazy(() => import('./blog-detail/Blog'));
const BlogView = lazy(() => import('./blog-detail/BlogView'));

const BlogsAppConfig = {
  routes: [
    {
      path: '/blogs',
      children: [
        {
          path: '',
          element: <BlogsList />,
        },
        {
          path: 'categories',
          element: <BlogCategoriesList />,
        },
        {
          path: 'categories/add',
          element: <BlogCategory />,
        },
        {
          path: 'categories/:categoryId',
          element: <BlogCategory />,
        },
        {
          path: 'add',
          element: <Blog />,
        },
        {
          path: ':blogId/edit',
          element: <Blog />,
        },
        {
          path: ':blogId',
          element: <BlogView />,
        },
      ],
    },
  ],
};

export default BlogsAppConfig;
