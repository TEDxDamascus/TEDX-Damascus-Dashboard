import { apiService } from 'app/store/apiService';
import axiosInstance from '../../services/axiosInstance';

export const addTagTypes = ['Users', 'User'];

export async function searchUserOptions(query) {
  const { data } = await axiosInstance.get('/users', {
    params: { search: query, limit: 20 },
  });
  const items = data?.data ?? [];
  return items.slice(0, 20).map((u) => ({
    id: u._id || u.id,
    label: u.name || u.email || u._id || u.id,
  }));
}

const usersApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, pageSize = 10, search } = {}) => ({
        url: '/users',
        method: 'GET',
        params: { page, limit: pageSize, search },
      }),
      transformResponse: (response) => {
        const items = (response?.data ?? []).map((u) => ({ ...u, id: u._id || u.id }));
        return { data: items, total: response?.total ?? items.length };
      },
      providesTags: ['Users'],
    }),

    getUser: builder.query({
      query: (userId) => ({ url: `/users/${userId}`, method: 'GET' }),
      transformResponse: (response) => {
        const u = response?.data ?? response;
        return { ...u, id: u._id || u.id };
      },
      providesTags: ['User'],
    }),

    createUser: builder.mutation({
      query: (data) => ({ url: '/users', method: 'POST', data }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Users', 'User'],
    }),

    updateUserPermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/users/${id}/permissions`,
        method: 'PATCH',
        data: permissions,
      }),
      invalidatesTags: ['Users', 'User'],
    }),

    bulkUpdateUsers: builder.mutation({
      async queryFn({ ids, data }, _api, _extraOptions, baseQuery) {
        const results = await Promise.all(
          ids.map((id) => baseQuery({ url: `/users/${id}`, method: 'PATCH', data })),
        );
        const errors = results.filter((r) => r.error);
        if (errors.length) return errors[0];
        return { data: { updated: ids.length } };
      },
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserPermissionsMutation,
  useBulkUpdateUsersMutation,
} = usersApi;

export default usersApi;
