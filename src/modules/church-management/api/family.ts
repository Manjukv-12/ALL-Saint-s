import { apiClient } from './client';

export interface FamilyLoginRequest {
  familyCode: string;
  password: string;
}

export interface FamilyLoginResponse {
  token: string;
  family: {
    id: string;
    familyCode: string;
  };
}

export const familyApi = {
  async login(credentials: FamilyLoginRequest) {
    const response = await apiClient.post<FamilyLoginResponse>(
      '/api/family/login',
      credentials
    );
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  async getProfile() {
    return apiClient.get('/api/family/profile');
  },

  async getFees() {
    return apiClient.get('/api/family/fees');
  },

  async getCertificates() {
    return apiClient.get('/api/family/certificates');
  },

  async getNotifications() {
    return apiClient.get('/api/family/notifications');
  },

  logout() {
    apiClient.setToken(null);
  },
};




