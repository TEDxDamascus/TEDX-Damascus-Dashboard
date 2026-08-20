import { apiService } from 'app/store/apiService';
import axiosInstance from '../../services/axiosInstance';

export const addTagTypes = ['Organizers', 'Organizer'];

export async function searchOrganizerOptions(query) {
  const { data } = await axiosInstance.get('/organizer', {
    params: { search: query, limit: 20 },
  });
  const items = data?.data ?? [];
  return items.slice(0, 20).map((o) => ({
    id: o._id || o.id,
    label: o.name?.en || o.name?.ar || o._id || o.id,
  }));
}

const organizersApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getOrganizers: builder.query({
      query: ({ page = 1, pageSize = 10, search, created_by, author_user_id } = {}) => ({
        url: '/organizer',
        method: 'GET',
        params: {
          limit: pageSize,
          page,
          search,
          ...(created_by ? { created_by } : {}),
          ...(author_user_id ? { author_user_id } : {}),
        },
      }),
      transformResponse: (response) => {
        const rawItems = response?.data ?? [];
        const items = rawItems.map((o) => ({ ...o, id: o._id || o.id }));
        return { data: { items, total: response?.total ?? items.length } };
      },
      providesTags: ['Organizers'],
    }),

    getOrganizer: builder.query({
      query: (id) => ({ url: `/organizer/${id}`, method: 'GET' }),
      transformResponse: (response) => {
        const o = response?.data ?? response;
        return { ...o, id: o._id || o.id };
      },
      providesTags: ['Organizer'],
    }),

    createOrganizer: builder.mutation({
      query: (data) => ({ url: '/organizer', method: 'POST', data }),
      invalidatesTags: ['Organizers'],
    }),

    updateOrganizer: builder.mutation({
      query: ({ id, data }) => ({ url: `/organizer/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Organizers', 'Organizer'],
    }),

    deleteOrganizer: builder.mutation({
      query: (id) => ({ url: `/organizer/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Organizers'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrganizersQuery,
  useGetOrganizerQuery,
  useCreateOrganizerMutation,
  useUpdateOrganizerMutation,
  useDeleteOrganizerMutation,
} = organizersApi;

export default organizersApi;
