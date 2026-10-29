import api from './api';
import type { User } from '../store/auth.store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refresh(): Promise<void> {
    await api.post('/auth/refresh');
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
