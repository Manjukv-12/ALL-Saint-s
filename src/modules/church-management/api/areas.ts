import { apiClient } from './client';

export interface ChurchAreasResponse {
  areas: string[];
}

export const areasApi = {
  async getAreas() {
    return apiClient.get<ChurchAreasResponse>('/api/church-management/areas');
  },
};
