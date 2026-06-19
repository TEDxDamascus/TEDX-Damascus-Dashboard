import { apiService } from 'app/store';

/**
 * List media: GET `/storage/media` → `{ success, data: { items, total?, page?, limit? } }`.
 * Normalize so the image picker keeps using `data.data.items` and `data.data.totalPages`.
 */
function normalizeMediaListResponse(response, { page = 1, limit = 20 } = {}) {
  const body = response && typeof response === 'object' ? response : {};
  const inner = body.data && typeof body.data === 'object' ? body.data : {};
  const items = Array.isArray(inner.items) ? inner.items : [];
  const total = Number(inner.total ?? inner.totalCount ?? inner.count) || items.length;
  const totalPages =
    Number(inner.totalPages) > 0
      ? Number(inner.totalPages)
      : Math.max(1, Math.ceil((total || items.length) / limit));
  return {
    ...body,
    data: {
      ...inner,
      items,
      total,
      totalPages,
      page: Number(inner.page) || page,
      limit: Number(inner.limit) || limit,
    },
  };
}

const storageApi = apiService.enhanceEndpoints({ addTagTypes: ['StorageMedia'] }).injectEndpoints({
  endpoints: (builder) => ({
    getMediaItems: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/storage/media',
        method: 'get',
        params: { page, limit },
      }),
      transformResponse: (response, meta, arg) =>
        normalizeMediaListResponse(response, { page: arg?.page, limit: arg?.limit }),
      providesTags: ['StorageMedia'],
    }),

    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: '/storage/upload',
        method: 'post',
        data: formData,
      }),
      invalidatesTags: ['StorageMedia'],
    }),

    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/storage/media/${encodeURIComponent(String(id || '').trim())}`,
        method: 'delete',
      }),
      invalidatesTags: ['StorageMedia'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMediaItemsQuery, useUploadMediaMutation, useDeleteMediaMutation } = storageApi;
export default storageApi;
