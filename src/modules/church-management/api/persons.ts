import { apiClient } from './client';
import type { Member, PersonProfile } from './types';

export const personsApi = {
  async searchPersons(q: string, limit = 30) {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return apiClient.get<Member[]>(`/api/church-management/persons/search?${params}`);
  },

  async getProfile(personId: string) {
    return apiClient.get<PersonProfile>(`/api/church-management/persons/${personId}/profile`);
  },

  async markDeceased(personId: string, data: { notes: string; eventDate?: string; successorId?: string }) {
    return apiClient.post<PersonProfile>(
      `/api/church-management/persons/${personId}/death`,
      data
    );
  },

  async returnHome(
    personId: string,
    data: {
      notes: string;
      spouseName: string;
    }
  ) {
    return apiClient.post<PersonProfile>(
      `/api/church-management/persons/${personId}/return-home`,
      data
    );
  },
};
