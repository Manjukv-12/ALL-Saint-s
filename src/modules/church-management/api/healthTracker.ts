import { apiClient } from './client';

export type HealthSegment =
  | 'Champion'
  | 'Stable'
  | 'Frustrated'
  | 'Fading'
  | 'At Risk'
  | 'Ghosting';

export type LoginConsistency = 'Consistent' | 'Irregular' | 'Sporadic';

export interface FamilyHealthRow {
  familyId: string;
  familyCode: string;
  status: string;
  memberCount: number;
  membersActive: number;
  feeRows: number;
  feesPaidRows: number;
  feesTotalAmount: number;
  feesPaidAmount: number;
  certificatesCount: number;
  profileComplete: boolean;
  activityM1: number;
  activityM2: number;
  activityM3: number;
  memberEngagementRate: number;
  feeCompletionRate: number;
  paymentCollectionRate: number;
  activityIntensity: number;
  activityDeclineRate: number;
  loginConsistency: LoginConsistency;
  loginConsistencyRatio: number;
  weeksActiveLast8: number;
  healthScore: number;
  segment: HealthSegment;
}

export interface HealthTrackerReport {
  generatedAt: string;
  totalFamilies: number;
  segmentCounts: Record<HealthSegment, number>;
  averageHealthScore: number;
  atRiskCount: number;
  families: FamilyHealthRow[];
  atRiskFamilies: FamilyHealthRow[];
}

export interface HealthTrackerSummary {
  generatedAt: string;
  totalFamilies: number;
  averageHealthScore: number;
  atRiskCount: number;
  segmentCounts: Record<string, number>;
}

export const healthTrackerApi = {
  getReport(segment?: HealthSegment) {
    const q = segment ? `?segment=${encodeURIComponent(segment)}` : '';
    return apiClient.get<HealthTrackerReport>(`/api/church-management/health-tracker${q}`);
  },

  getFamilyHealth(familyId: string) {
    return apiClient.get<FamilyHealthRow>(`/api/church-management/health-tracker/${familyId}`);
  },

  getSummary() {
    return apiClient.get<HealthTrackerSummary>('/api/church-management/health-tracker/summary');
  },

  getAtRisk() {
    return apiClient.get<{
      generatedAt: string;
      count: number;
      families: FamilyHealthRow[];
      segmentCounts: Record<string, number>;
    }>('/api/church-management/health-tracker/at-risk');
  },
};
