import { apiClient } from './client';

export interface DashboardStats {
  totalFamilies: number;
  totalMembers: number;
  familiesWithUnpaidFees: number;
  totalUnpaidAmount: number;
  totalPaidAmount: number;
  totalFeesAmount: number;
  certificatesThisMonth: number;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    target: string;
    sentAt?: string;
    createdAt: string;
  }>;
}

export const statsApi = {
  async getDashboardStats() {
    return apiClient.get<DashboardStats>('/api/church-management/stats');
  },
};

