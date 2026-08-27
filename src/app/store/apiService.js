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
      // axiosInstance rejects with a normalizeError shape: { status, message, data, raw }
      return {
        error: {
          status: error.status,
          data: error.data,
          message: error.message,
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
