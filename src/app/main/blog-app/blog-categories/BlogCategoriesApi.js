import { apiService } from 'app/store/apiService';
import axiosInstance from '../../../services/axiosInstance';
import { ensureLocaleValue } from '../../../shared-components/locale-input';

export const addTagTypes = ['BlogCategories', 'BlogCategory'];

function normalizeLocalePair(raw) {
  if (raw == null) return { ar: '', en: '' };
  if (typeof raw === 'string') return { ar: '', en: String(raw).trim() };
  return {
    ar: String(raw.ar ?? '').trim(),
    en: String(raw.en ?? '').trim(),
  };
}

/** Build PATCH/POST body; `name` / `description` may be `{ ar, en }` or plain strings (same value both locales). */
function toLocalePayload(name, description) {
  const n = ensureLocaleValue(
    typeof name === 'object' && name !== null ? name : { en: name, ar: name },
  );
  const d = ensureLocaleValue(
    typeof description === 'object' && description !== null
      ? description
      : { en: description, ar: description },
  );
  return {
    name: { ar: String(n.ar || '').trim(), en: String(n.en || '').trim() },
    description: { ar: String(d.ar || '').trim(), en: String(d.en || '').trim() },
  };
}

/** Map API category document to list row shape expected by BlogCategoriesList. */
function categoryToListRow(cat) {
  if (!cat) return null;
  const nameLocales = normalizeLocalePair(cat.name);
  const descriptionLocales = normalizeLocalePair(cat.description);
  return {
    id: cat._id || cat.id,
    nameLocales,
    descriptionLocales,
    name: nameLocales.en || nameLocales.ar,
    description: descriptionLocales.en || descriptionLocales.ar,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  };
}

function normalizeListResponse(response) {
  const list = Array.isArray(response?.data) ? response.data : [];
  const items = list.map(categoryToListRow).filter(Boolean);
  return {
    ...response,
    data: { items, total: items.length },
  };
}

export async function searchBlogCategoryOptions(query) {
  try {
    const { data: body } = await axiosInstance({ url: '/categories', method: 'get' });
    const list = Array.isArray(body?.data) ? body.data : [];
    const term = String(query || '')
      .trim()
      .toLowerCase();
    return list
      .map(categoryToListRow)
      .filter((c) => {
        if (!c) return false;
        if (!term) return true;
        const blob = [
          c.nameLocales?.ar,
          c.nameLocales?.en,
          c.descriptionLocales?.ar,
          c.descriptionLocales?.en,
        ]
          .join(' ')
          .toLowerCase();
        return blob.includes(term);
      })
      .slice(0, 20)
      .map((c) => {
        const en = String(c.nameLocales?.en || '').trim();
        const ar = String(c.nameLocales?.ar || '').trim();
        const label = [en, ar].filter(Boolean).join(' · ') || c.id;
        return { id: c.id, label };
      });
  } catch {
    return [];
  }
}

const blogCategoriesApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getBlogCategories: builder.query({
      query: () => ({ url: '/categories', method: 'get' }),
      transformResponse: normalizeListResponse,
      providesTags: ['BlogCategories'],
    }),

    createBlogCategory: builder.mutation({
      query: ({ name, description } = {}) => ({
        url: '/categories',
        method: 'post',
        data: toLocalePayload(name, description),
      }),
      transformResponse: (response) => ({
        ...response,
        data: categoryToListRow(response?.data) ?? response?.data,
      }),
      invalidatesTags: ['BlogCategories'],
    }),

    updateBlogCategory: builder.mutation({
      query: ({ id, name, description }) => ({
        url: `/categories/${id}`,
        method: 'patch',
        data: toLocalePayload(name, description),
      }),
      transformResponse: (response) => ({
        ...response,
        data: categoryToListRow(response?.data) ?? response?.data,
      }),
      invalidatesTags: ['BlogCategories'],
    }),

    deleteBlogCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'delete',
      }),
      invalidatesTags: ['BlogCategories'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogCategoriesApi;

export default blogCategoriesApi;
