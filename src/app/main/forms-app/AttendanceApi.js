import { apiService } from 'app/store/apiService';

export const addTagTypes = ['Attendance'];

const attendanceApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceList: builder.query({
      query: ({ eventId, page = 1, pageSize = 10 }) => ({
        url: '/attendance',
        method: 'GET',
        params: { eventId, page, limit: pageSize },
      }),
      transformResponse: (response) => {
        const raw = response?.data ?? {};
        const items = (raw.items ?? []).map((a) => ({ ...a, id: a._id || a.id }));
        return {
          data: {
            items,
            total: raw.total ?? items.length,
            page: raw.page ?? 1,
            pageSize: raw.limit ?? 10,
          },
        };
      },
      providesTags: ['Attendance'],
    }),

    addToAttendanceFromSubmissions: builder.mutation({
      query: ({ eventId, submissionIds }) => ({
        url: '/attendance/from-submissions',
        method: 'POST',
        data: { eventId, submissionIds },
      }),
      invalidatesTags: ['Attendance'],
    }),

    inviteAttendanceList: builder.mutation({
      query: ({ attendanceIds, subject, htmlMessage }) => ({
        url: '/attendance/invite',
        method: 'POST',
        data: { attendanceIds, subject, htmlMessage },
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttendanceListQuery,
  useAddToAttendanceFromSubmissionsMutation,
  useInviteAttendanceListMutation,
} = attendanceApi;

export default attendanceApi;
