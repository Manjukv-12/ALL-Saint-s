import { apiClient } from './client';
import type { Family, CreateFamilyRequest, Member, CreateMemberRequest } from './types';
import {
  clearMemberPhoto,
  syncMemberPhoto,
  uploadMemberPhoto,
} from './memberPhoto';

export interface FamiliesResponse {
  families: Family[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RootFamilyLineageOption {
  id: string;
  familyCode: string;
  headName?: string | null;
  houseName?: string | null;
  label: string;
}

export const familiesApi = {
  async getFamilies(
    search?: string,
    page = 1,
    limit = 20,
    generation?: number,
    area?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (generation) params.append('generation', generation.toString());
    if (area) params.append('area', area);
    
    return apiClient.get<FamiliesResponse>(`/api/church-management/families?${params.toString()}`);
  },

  async getFamily(id: string) {
    return apiClient.get<Family>(`/api/church-management/families/${id}`);
  },

  async getRootFamiliesForLineage() {
    return apiClient.get<{ roots: RootFamilyLineageOption[] }>(
      '/api/church-management/families/roots'
    );
  },

  async createFamily(data: CreateFamilyRequest) {
    return apiClient.post<Family>('/api/church-management/families', data);
  },

  async updateFamily(id: string, data: Partial<CreateFamilyRequest> & { status?: Family['status'] }) {
    return apiClient.put<Family>(`/api/church-management/families/${id}`, data);
  },

  async deleteFamily(id: string) {
    return apiClient.delete(`/api/church-management/families/${id}`);
  },

  async splitFamily(familyId: string, data: {
    newFamilyCode?: string;
    newHeadOfFamilyId: string;
    memberIds?: string[];
    newAddress?: string;
    area?: string;
    autoGenerateCode?: boolean;
    notes: string;
    membershipType?: 'FULL' | 'ASSOCIATE';
    associateJoinDate?: string;
    associateLeftDate?: string;
  }) {
    return apiClient.post<{
      message: string;
      originalFamily: Family;
      newFamily: Family;
    }>(`/api/church-management/families/${familyId}/split`, data);
  },

  async setHeadOfFamily(familyId: string, personId: string) {
    return apiClient.put<{
      message: string;
      headOfFamilyId: string;
      headOfFamilyName: string;
      family: Family;
    }>(`/api/church-management/families/${familyId}/head-of-family`, { personId });
  },

  async markDaughterMarried(familyId: string, memberId: string, data: {
    spouseName: string;
    marriageDate: string;
    relatedFamilyId?: string;
    externalFamilyName?: string;
    externalFamilyAddress?: string;
    notes: string;
  }) {
    return apiClient.post<{
      message: string;
      member: Member;
      note: string;
    }>(`/api/church-management/families/${familyId}/members/${memberId}/marry`, data);
  },
};

export const membersApi = {
  async getMembers(familyId?: string, search?: string, status?: string, area?: string) {
    const params = new URLSearchParams();
    if (familyId) params.append('familyId', familyId);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (area) params.append('area', area);
    
    const query = params.toString();
    return apiClient.get<Member[]>(`/api/church-management/members${query ? `?${query}` : ''}`);
  },

  async getMember(id: string) {
    return apiClient.get<Member>(`/api/church-management/members/${id}`);
  },

  async createMember(data: CreateMemberRequest) {
    // Map phone to contactNumber for backend compatibility
    const payload: any = { ...data };
    if (payload.phone && !payload.contactNumber) {
      payload.contactNumber = payload.phone;
      delete payload.phone;
    }
    return apiClient.post<Member>('/api/church-management/members', payload);
  },

  async updateMember(id: string, data: Partial<CreateMemberRequest>) {
    // Map phone to contactNumber for backend compatibility
    const payload: any = { ...data };
    if (payload.phone && !payload.contactNumber) {
      payload.contactNumber = payload.phone;
      delete payload.phone;
    }
    // Map dob/dow to dateOfBirth/dateOfWedding
    if (payload.dob) {
      payload.dateOfBirth = payload.dob;
      delete payload.dob;
    }
    if (payload.dow) {
      payload.dateOfWedding = payload.dow;
      delete payload.dow;
    }
    if (payload.dobBaptism && !payload.dateOfBaptism) {
      payload.dateOfBaptism = payload.dobBaptism;
    }
    delete payload.dobBaptism;
    if (payload.dobConfirmation && !payload.dateOfConfirmation) {
      payload.dateOfConfirmation = payload.dobConfirmation;
    }
    delete payload.dobConfirmation;
    return apiClient.put<Member>(`/api/church-management/members/${id}`, payload);
  },

  async deleteMember(id: string) {
    return apiClient.delete(`/api/church-management/members/${id}`);
  },

  uploadPhoto: uploadMemberPhoto,
  clearPhoto: clearMemberPhoto,
  syncPhoto: syncMemberPhoto,
};



