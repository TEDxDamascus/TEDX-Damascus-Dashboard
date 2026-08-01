import axios from 'axios';
import { tokenService } from './tokenService';
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // Let the browser set multipart boundary (otherwise Nest returns "File is required").
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
let isRefreshing = false;
let refreshQueue = [];
function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  refreshQueue = [];
}
function forceLogout() {
  tokenService.clearTokens();
  window.dispatchEvent(new Event('auth:logout'));
}
function normalizeError(error) {
  return {
    status: error.response?.status,
    message: error.response?.data?.message || error.message || 'An unexpected error occurred',
    data: error.response?.data,
    raw: error,
  };
}
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status !== 401 || original.url?.includes('/auth/login')) {
      return Promise.reject(normalizeError(error));
    }
    if (original._retry) {
      forceLogout();
      return Promise.reject(normalizeError(error));
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token: newRefresh } = data.data;
      tokenService.setTokens({
        access_token,
        refresh_token: newRefresh,
      });
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      processQueue(null, access_token);
      original.headers.Authorization = `Bearer ${access_token}`;
      return axiosInstance(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(normalizeError(refreshError));
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
