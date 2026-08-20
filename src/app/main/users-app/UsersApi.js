import { apiService } from 'app/store/apiService';
import axiosInstance from '../../services/axiosInstance';
import { normalizeUser, normalizeUsersList } from './models/userMappers';

export const addTagTypes = ['Users', 'User', 'Permissions', 'Profile'];

export async function searchUserOptions(query) {
  const { data } = await axiosInstance.get('/users/admins', {
    params: { search: query, limit: 20 },
  });
  const items = data?.data ?? [];
  return items.slice(0, 20).map((u) => {
    const user = normalizeUser(u);
    return {
      id: user.id,
      label: user.name || user.email || user.id,
    };
  });
}

const usersApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, pageSize = 10, search, role } = {}) => {
        // Dedicated admins endpoint returns correct role/name for admins list
        if (role === 'admin') {
          return {
            url: '/users/admins',
            method: 'GET',
            params: {
              page,
              limit: pageSize,
              ...(search ? { search } : {}),
            },
          };
        }
        return {
          url: '/admin/users',
          method: 'GET',
          params: {
            page,
            limit: pageSize,
            role: 'user',
            ...(search ? { search } : {}),
          },
        };
      },
      transformResponse: (response, _meta, arg) => {
        const normalized = normalizeUsersList(response);
        if (arg?.role === 'admin') {
          normalized.items = normalized.items.map((u) => ({
            ...u,
            role: u.role === 'superadmin' ? 'superadmin' : 'admin',
          }));
        }
        return normalized;
      },
      providesTags: ['Users'],
    }),

    getUser: builder.query({
      query: (userId) => ({ url: `/admin/users/${userId}`, method: 'GET' }),
      transformResponse: (response) => normalizeUser(response?.data ?? response),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Backend has no GET /admin/users/:id/permissions (404).
    // Permissions are returned on the user object from GET /admin/users/:id.
    getUserPermissions: builder.query({
      query: (userId) => ({ url: `/admin/users/${userId}`, method: 'GET' }),
      transformResponse: (response) => {
        const u = response?.data ?? response ?? {};
        const perms = u.permissions ?? [];
        return Array.isArray(perms) ? perms : [];
      },
      providesTags: (result, error, userId) => [{ type: 'User', id: `${userId}-permissions` }],
    }),

    getAvailablePermissions: builder.query({
      query: () => ({ url: '/users/permissions', method: 'GET' }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: ['Permissions'],
    }),

    getMyProfile: builder.query({
      query: () => ({ url: '/users/me', method: 'GET' }),
      transformResponse: (response) => normalizeUser(response?.data ?? response),
      providesTags: ['Profile'],
    }),

    updateMyProfile: builder.mutation({
      query: (data) => ({ url: '/users/me', method: 'PATCH', data }),
      invalidatesTags: ['Profile'],
    }),

    createUser: builder.mutation({
      query: (data) => ({ url: '/admin/users', method: 'POST', data }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => ({ url: `/admin/users/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Users', 'User'],
    }),

    updateUserPermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/admin/users/${id}/permissions`,
        method: 'PATCH',
        data: { permissions },
      }),
      invalidatesTags: ['Users', 'User'],
    }),

    enableUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/enable`, method: 'PATCH' }),
      invalidatesTags: ['Users', 'User'],
    }),

    disableUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}/disable`, method: 'PATCH' }),
      invalidatesTags: ['Users', 'User'],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    bulkEnableUsers: builder.mutation({
      async queryFn({ ids }, _api, _extraOptions, baseQuery) {
        const results = await Promise.all(
          ids.map((id) => baseQuery({ url: `/admin/users/${id}/enable`, method: 'PATCH' })),
        );
        const errors = results.filter((r) => r.error);
        if (errors.length) return errors[0];
        return { data: { updated: ids.length } };
      },
      invalidatesTags: ['Users'],
    }),

    bulkDisableUsers: builder.mutation({
      async queryFn({ ids }, _api, _extraOptions, baseQuery) {
        const results = await Promise.all(
          ids.map((id) => baseQuery({ url: `/admin/users/${id}/disable`, method: 'PATCH' })),
        );
        const errors = results.filter((r) => r.error);
        if (errors.length) return errors[0];
        return { data: { updated: ids.length } };
      },
      invalidatesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetUserPermissionsQuery,
  useGetAvailablePermissionsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserPermissionsMutation,
  useEnableUserMutation,
  useDisableUserMutation,
  useDeleteUserMutation,
  useBulkEnableUsersMutation,
  useBulkDisableUsersMutation,
} = usersApi;

export default usersApi;
