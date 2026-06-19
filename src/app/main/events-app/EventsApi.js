import { apiService } from 'app/store/apiService';

const eventsApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL EVENTS
    getEvents: builder.query({
      query: ({ page = 1, pageSize = 10, search } = {}) => ({
        url: '/events',
        method: 'GET',
        params: { page, pageSize, search },
      }),

      transformResponse: (response) => {
        const items = response?.data ?? [];

        const mapped = items.map((event) => ({
          id: event._id,
          title: event.title,
          event_image: event.event_image,
          event_type: event.event_type,
          date: event.date,
          location: event.location,
          status: event.status,
          speakers: event.speakers ?? [],
          gallery: event.gallery ?? [],
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
          title: e.title,
          event_image: e.event_image,
          event_type: e.event_type,
          date: e.date?.split('T')[0],
          location: e.location,
          description: e.description,
          brief: e.breif,
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
