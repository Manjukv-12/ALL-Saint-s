import { apiClient } from './client';
import type { Post, Alert, HealthResponse, ApiInfo } from './types';

export const publicApi = {
  async getHealth() {
    return apiClient.get<HealthResponse>('/health');
  },

  async getApiInfo() {
    return apiClient.get<ApiInfo>('/');
  },

  async getPosts() {
    return apiClient.get<Post[]>('/api/public/posts');
  },

  async getAlerts() {
    return apiClient.get<Alert[]>('/api/public/alerts');
  },
};




