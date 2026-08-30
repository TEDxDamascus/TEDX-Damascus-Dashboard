import { apiService } from 'app/store/apiService';
import axiosInstance from '../../services/axiosInstance';

export const addTagTypes = ['TeamMembers', 'TeamMember'];

export async function searchTeamOptions(query) {
  const { data } = await axiosInstance.get('/team', {
    params: { search: query, limit: 20 },
  });
  const items = data?.data ?? [];
  return items.slice(0, 20).map((m) => ({
    id: m._id || m.id,
    label: m.name?.en || m.name?.ar || m._id || m.id,
  }));
}

const teamApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getTeam: builder.query({
      query: ({ page = 1, pageSize = 10, search, created_by, author_user_id } = {}) => ({
        url: '/team',
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
        const raw = response?.data;
        const itemsArr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        const items = itemsArr.map((m) => ({ ...m, id: m._id || m.id }));
        const total =
          response?.meta?.total ??
          response?.pagination?.total ??
          raw?.total ??
          response?.total ??
          response?.totalCount ??
          response?.count ??
          items.length;
        return { data: { items, total: Number(total) || items.length } };
      },
      providesTags: ['TeamMembers'],
    }),

    getTeamMember: builder.query({
      query: (id) => ({ url: `/team/${id}`, method: 'GET' }),
      transformResponse: (response) => {
        const m = response?.data ?? response;
        return { ...m, id: m._id || m.id };
      },
      providesTags: ['TeamMember'],
    }),

    createTeamMember: builder.mutation({
      query: (data) => ({ url: '/team', method: 'POST', data }),
      invalidatesTags: ['TeamMembers'],
    }),

    updateTeamMember: builder.mutation({
      query: ({ id, data }) => ({ url: `/team/${id}`, method: 'PATCH', data }),
      invalidatesTags: ['TeamMembers', 'TeamMember'],
    }),

    deleteTeamMember: builder.mutation({
      query: (id) => ({ url: `/team/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TeamMembers'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTeamQuery,
  useGetTeamMemberQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
} = teamApi;

export default teamApi;
