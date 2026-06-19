import { apiService } from 'app/store/apiService';
import axiosInstance from '../../services/axiosInstance';

export const addTagTypes = ['Speakers', 'Speaker'];

export async function searchSpeakerOptions(query) {
  const { data } = await axiosInstance.get('/speakers', {
    params: { search: query, limit: 20 },
  });
  const items = data?.data ?? [];
  return items.slice(0, 20).map((s) => ({
    id: s._id || s.id,
    label: (typeof s.name === 'string' ? s.name : s.name?.en || s.name?.ar) || s._id || s.id,
  }));
}

const speakersApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getSpeakers: builder.query({
      query: ({ page = 1, pageSize = 10, search } = {}) => ({
        url: '/speakers',
        method: 'GET',
        params: { limit: pageSize, page, search },
      }),
      transformResponse: (response) => {
        const rawItems = response?.data ?? [];
        const items = rawItems.map((s) => ({ ...s, id: s._id || s.id }));
        return { data: { items, total: response?.total ?? items.length } };
      },
      providesTags: ['Speakers'],
    }),

    getSpeaker: builder.query({
      query: (id) => ({ url: `/speakers/${id}`, method: 'GET' }),
      transformResponse: (response) => {
        const s = response?.data ?? response;
        return { ...s, id: s._id || s.id };
      },
      providesTags: ['Speaker'],
    }),

    createSpeaker: builder.mutation({
      query: (data) => ({ url: '/speakers', method: 'POST', data }),
      invalidatesTags: ['Speakers'],
    }),

    updateSpeaker: builder.mutation({
      query: ({ id, data }) => ({ url: `/speakers/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Speakers', 'Speaker'],
    }),

    deleteSpeaker: builder.mutation({
      query: (id) => ({ url: `/speakers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Speakers'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSpeakersQuery,
  useGetSpeakerQuery,
  useCreateSpeakerMutation,
  useUpdateSpeakerMutation,
  useDeleteSpeakerMutation,
} = speakersApi;

export default speakersApi;
