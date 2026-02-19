import apiClient from './client';
import { LoginCredentials, LoginResponse, ChangePasswordPayload, User } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    return apiClient.post<void>('/auth/change-password', payload);
  },
};
