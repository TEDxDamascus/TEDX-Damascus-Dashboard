import { apiService } from 'app/store/apiService';
import axiosInstance from '../../services/axiosInstance';

export const addTagTypes = ['Blogs', 'Blog', 'BlogReferences', 'BlogReference'];

function matchBlogId(blog, id) {
  return String(blog.id) === String(id) || String(blog._id) === String(id);
}

function getBlogTitle(blog) {
  if (typeof blog?.title === 'string') return blog.title;
  if (blog?.title && typeof blog.title === 'object') {
    return blog.title.en || blog.title.ar || 'Untitled';
  }
  return 'Untitled';
}

function extractBlogArrayFromResponseBody(body) {
  const d = body?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.items)) return d.items;
  if (d && Array.isArray(d.blogs)) return d.blogs;
  if (d && Array.isArray(d.results)) return d.results;
  return [];
}

function normalizeBlogListResponse(response) {
  const items = extractBlogArrayFromResponseBody(response);
  const d = response?.data;
  const total =
    (d && typeof d === 'object' && !Array.isArray(d) && (d.total ?? d.count)) ?? items.length;
  const page = (d && typeof d === 'object' && !Array.isArray(d) && d.page) ?? 1;
  const limit = (d && typeof d === 'object' && !Array.isArray(d) && d.limit) ?? items.length;
  return {
    ...response,
    data: { items, total: Number(total) || items.length, page, limit },
  };
}

export async function searchBlogOptions(query, { excludeId } = {}) {
  try {
    const term = String(query || '').trim();
    const { data: body } = await axiosInstance({
      url: '/blogs',
      method: 'get',
      params: {
        page: 1,
        limit: 100,
        ...(term ? { search: term } : {}),
      },
    });
    const list = extractBlogArrayFromResponseBody(body);
    return list
      .filter((blog) => !excludeId || !matchBlogId(blog, excludeId))
      .slice(0, 20)
      .map((blog) => ({
        id: blog._id || blog.id,
        label: getBlogTitle(blog),
      }));
  } catch {
    return [];
  }
}

/** GET `/blog-references` returns `{ data: Reference[] }`. */
function normalizeBlogReferencesListResponse(response) {
  const d = response?.data;
  const items = Array.isArray(d) ? d : [];
  return { ...response, data: items };
}

function invalidateBlogReferenceTags(blogId, referenceId) {
  const tags = ['Blogs'];
  if (blogId) tags.push({ type: 'BlogReferences', id: String(blogId) });
  if (referenceId) tags.push({ type: 'BlogReference', id: String(referenceId) });
  return tags;
}

const blogsApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: ({
        page = 1,
        limit = 10,
        status,
        category_id,
        search,
        language,
        sort,
        order,
      } = {}) => ({
        url: '/blogs',
        method: 'get',
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
          ...(category_id ? { category_id } : {}),
          ...(search ? { search: String(search).trim() } : {}),
          ...(language ? { language } : {}),
          ...(sort ? { sort } : {}),
          ...(order ? { order } : {}),
        },
      }),
      transformResponse: normalizeBlogListResponse,
      providesTags: ['Blogs'],
    }),

    getBlog: builder.query({
      query: (blogId) => ({ url: `/blogs/${blogId}`, method: 'get' }),
      providesTags: (result, error, blogId) => [{ type: 'Blog', id: blogId }],
    }),

    createBlog: builder.mutation({
      query: (data) => ({
        url: '/blogs',
        method: 'post',
        data,
      }),
      invalidatesTags: ['Blogs'],
    }),

    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (result, error, { id }) => ['Blogs', { type: 'Blog', id }],
    }),

    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'delete',
      }),
      invalidatesTags: (result, error, id) => ['Blogs', { type: 'Blog', id }],
    }),

    /** GET `/blog-references?blog_id=` — list references for one blog. */
    getBlogReferencesByBlog: builder.query({
      query: (blogId) => ({
        url: '/blog-references',
        method: 'get',
        params: { blog_id: blogId },
      }),
      transformResponse: normalizeBlogReferencesListResponse,
      providesTags: (result, error, blogId) => [{ type: 'BlogReferences', id: String(blogId) }],
    }),

    /** GET `/blog-references/:id` — single reference. */
    getBlogReferenceById: builder.query({
      query: (referenceId) => ({
        url: `/blog-references/${referenceId}`,
        method: 'get',
      }),
      providesTags: (result, error, referenceId) => [
        { type: 'BlogReference', id: String(referenceId) },
      ],
    }),

    /** POST body: `{ blog_id, name, desc, url }`. */
    createBlogReference: builder.mutation({
      query: (body) => ({
        url: '/blog-references',
        method: 'post',
        data: body,
      }),
      invalidatesTags: (result, error, arg) =>
        invalidateBlogReferenceTags(arg?.blog_id, null).concat(
          arg?.blog_id ? [{ type: 'Blog', id: String(arg.blog_id) }] : [],
        ),
    }),

    /** PATCH `/blog-references/:id` — body `{ name, desc, url }`. */
    updateBlogReference: builder.mutation({
      query: ({ referenceId, data }) => ({
        url: `/blog-references/${referenceId}`,
        method: 'patch',
        data,
      }),
      invalidatesTags: (result, error, arg) =>
        invalidateBlogReferenceTags(arg?.blogId, arg?.referenceId),
    }),

    /** DELETE `/blog-references/:id`. */
    deleteBlogReference: builder.mutation({
      query: ({ referenceId }) => ({
        url: `/blog-references/${referenceId}`,
        method: 'delete',
      }),
      invalidatesTags: (result, error, arg) =>
        invalidateBlogReferenceTags(arg?.blogId, arg?.referenceId),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetBlogReferencesByBlogQuery,
  useGetBlogReferenceByIdQuery,
  useCreateBlogReferenceMutation,
  useUpdateBlogReferenceMutation,
  useDeleteBlogReferenceMutation,
} = blogsApi;

export default blogsApi;
