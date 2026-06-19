import { apiService } from 'app/store/apiService';

export const addTagTypes = ['HomeSettings'];

const homeSettingsApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getHomeSettings: builder.query({
      query: () => ({
        url: '/homesettings',
        method: 'GET',
      }),
      transformResponse: (response) => {
        const doc = response?.data ?? response ?? {};
        return {
          id: doc._id || doc.id,
          sections: doc.sections ?? {},
        };
      },
      providesTags: ['HomeSettings'],
    }),

    updateHomeSettings: builder.mutation({
      query: ({ id, data }) => ({
        url: `/homesettings/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['HomeSettings'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetHomeSettingsQuery, useUpdateHomeSettingsMutation } = homeSettingsApi;

export default homeSettingsApi;
