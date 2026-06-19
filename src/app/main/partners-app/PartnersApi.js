import { apiService } from 'app/store/apiService';

export const addTagTypes = ['Partners', 'Partner'];

const partnersApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query({
      query: ({ page = 1, pageSize = 10, search } = {}) => ({
        url: '/partners',
        method: 'GET',
        params: { limit: pageSize, page, search },
      }),
      transformResponse: (response) => {
        const rawItems = response?.data ?? [];
        const items = rawItems.map((p) => ({ ...p, id: p._id || p.id }));
        return { data: { items, total: response?.total ?? items.length } };
      },
      providesTags: ['Partners'],
    }),

    getPartner: builder.query({
      query: (id) => ({ url: `/partners/${id}`, method: 'GET' }),
      transformResponse: (response) => {
        const p = response?.data ?? response;
        return { ...p, id: p._id || p.id };
      },
      providesTags: ['Partner'],
    }),

    createPartner: builder.mutation({
      query: (data) => ({ url: '/partners', method: 'POST', data }),
      invalidatesTags: ['Partners'],
    }),

    updatePartner: builder.mutation({
      query: ({ id, data }) => ({ url: `/partners/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['Partners', 'Partner'],
    }),

    deletePartner: builder.mutation({
      query: (id) => ({ url: `/partners/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Partners'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPartnersQuery,
  useGetPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
} = partnersApi;

export default partnersApi;
