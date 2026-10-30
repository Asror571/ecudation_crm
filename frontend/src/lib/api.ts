import axios, { isAxiosError } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? '';
    const isLoginRequest = url.endsWith('/auth/login');
    const isRefreshRequest = url.endsWith('/auth/refresh');

    if (
      isLoginRequest ||
      isRefreshRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      await api.post('/auth/refresh');
      return api(originalRequest);
    } catch (refreshError: unknown) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;
