import axiosInstance from './axiosInstance';

export async function adminLogin(email, password) {
  const response = await axiosInstance.post('/admin/login', { email, password });
  return { data: response.data.data };
}

/** @deprecated Prefer adminLogin for dashboard access */
export async function login(email, password) {
  return adminLogin(email, password);
}

export async function fetchMyProfile() {
  const response = await axiosInstance.get('/users/me');
  return response.data?.data ?? response.data;
}
