import axiosInstance from './axiosInstance';

export async function login(email, password) {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return { data: response.data.data };
}
