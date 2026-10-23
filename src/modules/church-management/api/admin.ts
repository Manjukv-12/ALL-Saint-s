import { apiClient } from './client';
import type { Admin, AdminLoginRequest, AdminLoginResponse } from './types';

export const adminApi = {
  async login(credentials: AdminLoginRequest) {
    const response = await apiClient.post<AdminLoginResponse>(
      '/api/church-management/auth/login',
      credentials
    );
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  async getMe() {
    return apiClient.get<Admin>('/api/church-management/auth/me');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return apiClient.post('/api/church-management/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  logout() {
    apiClient.setToken(null);
  },
};




