import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from '../services/axiosInstance';

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };

export const apiService = createApi({
  reducerPath: 'apiService',
  baseQuery: axiosBaseQuery(),

  tagTypes: ['Events', 'Event'],

  endpoints: () => ({}),
});

export default apiService;
