import { apiService } from 'app/store/apiService';

const toLocale = (v) => {
  if (v && typeof v === 'object' && ('en' in v || 'ar' in v)) {
    return { en: String(v.en ?? ''), ar: String(v.ar ?? '') };
  }
  if (typeof v === 'string') return { en: v, ar: '' };
  return { en: '', ar: '' };
};

const eventsApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL EVENTS
    getEvents: builder.query({
      query: ({ page = 1, pageSize = 10, search, created_by, author_user_id } = {}) => ({
        url: '/events',
        method: 'GET',
        params: {
          page,
          pageSize,
          search,
          ...(created_by ? { created_by } : {}),
          ...(author_user_id ? { author_user_id } : {}),
        },
      }),

      transformResponse: (response) => {
        const items = response?.data ?? [];

        const mapped = items.map((event) => ({
          id: event._id || event.id,
          title: event.title,
          event_image: event.event_image,
          event_type: event.event_type,
          date: event.date,
          location: event.location,
          status: event.status,
          speakers: event.speakers ?? [],
          gallery: event.gallery ?? [],
          created_by: event.created_by,
          createdBy: event.createdBy,
          user_id: event.user_id,
          author_user_id: event.author_user_id,
        }));

        return {
          items: mapped,
          total: response?.total ?? mapped.length,
        };
      },

      providesTags: ['Events'],
    }),

    // GET ONE EVENT
    getEvent: builder.query({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),

      transformResponse: (response) => {
        const e = response?.data;

        return {
          id: e._id,
          title: toLocale(e.title),
          event_image: e.event_image,
          event_type: e.event_type,
          date: e.date?.split('T')[0],
          location: toLocale(e.location),
          location_email: e.location_email ?? '',
          location_phone: e.location_phone ?? '',
          location_description: toLocale(e.location_description),
          start_time: e.start_time ?? '',
          end_time: e.end_time ?? '',
          coordinates: e.coordinates ?? [],
          volunteers_count: e.volunteers_count ?? '',
          description: toLocale(e.description),
          brief: toLocale(e.brief ?? e.breif),
          status: e.status,
          speakers: (e.speakers ?? []).map((s) =>
            typeof s === 'object' && s !== null
              ? { id: s._id || s.id, label: s.name?.en || s.name?.ar || '' }
              : { id: s, label: s },
          ),
          gallery: e.gallery ?? [],
        };
      },

      providesTags: ['Event'],
    }),

    // CREATE
    createEvent: builder.mutation({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Events'],
    }),

    // UPDATE
    updateEvent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Events', 'Event'],
    }),

    // DELETE
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventsApi;

export default eventsApi;
