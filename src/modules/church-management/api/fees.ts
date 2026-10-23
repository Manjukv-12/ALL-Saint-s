import { apiClient } from './client';
import { downloadChurchMgmtXlsx } from '@/modules/church-management/lib/downloadXlsx';

export enum MembershipFeeState {
  NO_FEE = 'NO_FEE',
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

/** YEARLY = membership calendar year; MONTHLY = month buckets; NONE = set amount when assigning. */
export type DueFrequency = 'YEARLY' | 'MONTHLY' | 'NONE';

export interface DueType {
  id: string;
  code: string;
  name: string;
  defaultAmount: number;
  frequency: DueFrequency;
  isActive: boolean;
  sortOrder: number;
  autoGenerate?: boolean;
}

export interface MembershipPaidUntil {
  year: number;
  month: number;
  label: string;
}

export interface MembershipSuggestedPayment {
  label: string;
  months: number;
  amount: number;
}

export interface MembershipPaymentHistoryItem {
  id: string;
  personId: string;
  familyId: string;
  amount: number;
  paidDate?: string | null;
  comments?: string | null;
  paidUntil?: MembershipPaidUntil | null;
  allocation?: {
    monthlyRate?: number;
    roundPayUnit?: number;
    totalApplied?: number;
    completeHint?: string | null;
    source?: string;
    lines?: Array<{
      year: number;
      month?: number | null;
      label: string;
      applied: number;
      fullyPaid?: boolean;
    }>;
  } | null;
  createdAt?: string | null;
  /** True when built from fee rows because cash ledger was empty. */
  legacy?: boolean;
}

export interface YearFeeCompletion {
  year: number;
  membershipComplete: boolean;
  membershipApplicable: boolean;
  membershipOutstanding: number;
  membershipPaidThrough?: MembershipPaidUntil | null;
  otherFeesComplete: boolean;
  otherFeesOutstanding: number;
  otherFeesCount: number;
  allComplete: boolean;
  label: string;
}

export interface MembershipFeeStatus {
  state: MembershipFeeState;
  amount?: number;
  amountDue?: number;
  amountPaid?: number;
  year?: number;
  paidDate?: string;
  eligible?: boolean;
  annualRate?: number;
  effectiveAnnual?: number;
  monthlyRate?: number;
  roundPayUnit?: number;
  yearRates?: Record<number, number>;
  arrearsAmount?: number;
  toCurrentMonthAmount?: number;
  completeYearMonths?: number;
  completeYearAmount?: number;
  completeYearThrough?: string | null;
  completeHint?: string | null;
  suggestedPayments?: MembershipSuggestedPayment[];
  paymentHistory?: MembershipPaymentHistoryItem[];
  paidUntil?: MembershipPaidUntil | null;
  paidUntilLabel?: string | null;
  nextDueMonth?: (MembershipPaidUntil & { remaining?: number }) | null;
  /** This year + last year completion (membership + other fees). */
  yearCompletions?: YearFeeCompletion[];
  selectedYearCompletion?: YearFeeCompletion | null;
  /** Profile-recorded balance through previousDuesThroughYear (2025 and earlier). */
  previousDues?: {
    hasOutstanding: boolean;
    amount?: number | null;
    throughYear: number;
    notes?: string | null;
    label: string;
  };
}

export interface MemberDue {
  id: string;
  personId: string;
  familyId: string;
  dueTypeId?: string;
  dueType?: DueType;
  year: number;
  month?: number | null;
  amountDue: number;
  amountPaid: number;
  amount: number;
  paid: boolean;
  paidDate?: string;
  comments?: string | null;
  state: MembershipFeeState;
  personName?: string;
  person?: {
    id: string;
    fullName: string;
  };
  /** Active | Separated | Deceased — kept so Married Away paid rows stay listed. */
  personStatus?: string;
  personStatusLabel?: string;
  familyCode?: string;
}

export type PersonDuesStatus =
  | 'UP_TO_DATE'
  | 'MEMBERSHIP_DUE'
  | 'OTHER_DUE'
  | 'BOTH_DUE';

/** One person in the church-wide Fees list (not every month row). */
export interface PersonDuesOverview {
  personId: string;
  personName: string;
  familyId: string;
  familyCode: string;
  personStatus?: string;
  paidUntilLabel?: string | null;
  nextDueLabel?: string | null;
  membershipOutstanding: number;
  otherOutstanding: number;
  totalOutstanding: number;
  status: PersonDuesStatus;
  payDue?: MemberDue | null;
  /** Manual profile balance through previousDuesThroughYear (separate from fee rows). */
  hasPreviousDues?: boolean;
  previousDuesAmount?: number | null;
  previousDuesThroughYear?: number;
  /** False when member exists but no fee rows for the selected year yet. */
  hasFeeRowsForYear?: boolean;
}

export interface PreviousDuesMemberRow {
  personId: string;
  personName: string;
  personStatus?: string;
  contactNumber?: string | null;
  familyId: string;
  familyCode: string;
  previousDuesAmount: number;
  previousDuesNotes?: string | null;
  previousDuesThroughYear: number;
}

export interface PreviousDuesListResponse {
  throughYear: number;
  totalAmount: number;
  people: PreviousDuesMemberRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DuesListResponse {
  year: number;
  view?: 'person' | 'rows';
  totalPaid: number;
  totalUnpaid: number;
  totalAmount: number;
  paidCount: number;
  unpaidCount: number;
  totalRows: number;
  familiesWithUnpaid: number;
  dues: MemberDue[];
  people?: PersonDuesOverview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FamilyDuesResponse {
  year: number;
  totalUnpaid: number;
  totalPaid: number;
  totalAmount: number;
  totalApplicable: number;
  membersPaid: number;
  membersUnpaid: number;
  totalMembers: number;
  noFeeCount: number;
  dues: MemberDue[];
  fees: MemberDue[];
}

export interface CreateDueRequest {
  personId: string;
  dueTypeId: string;
  year: number;
  amountDue?: number;
  month?: number;
  comments?: string;
  amountPaid?: number;
  paidDate?: string;
  /** Always insert a new row (needed for multiple membership payments in one year). */
  newEntry?: boolean;
}

export interface UpdateDueRequest {
  amountDue?: number;
  year?: number;
  month?: number | null;
  comments?: string;
}

export interface RecordPaymentRequest {
  amountPaid: number;
  paidDate?: string;
  comments?: string;
}

export interface CreateDueTypeRequest {
  code: string;
  name: string;
  defaultAmount: number;
  frequency: DueFrequency;
  sortOrder?: number;
  autoGenerate?: boolean;
}

export const feesApi = {
  async getDueTypes(options?: { all?: boolean; manual?: boolean; auto?: boolean }) {
    const params = new URLSearchParams();
    if (options?.all) params.set('all', '1');
    if (options?.manual) params.set('mode', 'manual');
    if (options?.auto) params.set('mode', 'auto');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<DueType[]>(`/api/church-management/fees/due-types${qs}`);
  },

  async getMembershipYearRates() {
    return apiClient.get<{ yearRates: Record<number, number> }>(
      '/api/church-management/fees/membership-year-rates'
    );
  },

  async createDueType(data: CreateDueTypeRequest) {
    return apiClient.post<DueType>('/api/church-management/fees/due-types', data);
  },

  async updateDueType(
    id: string,
    data: Partial<CreateDueTypeRequest & { isActive: boolean; year?: number; repriceYear?: boolean }>
  ) {
    return apiClient.patch<DueType>(`/api/church-management/fees/due-types/${id}`, data);
  },

  async getFamilyDues(familyId: string, year?: number, dueTypeId?: string) {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (dueTypeId) params.set('dueTypeId', dueTypeId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<FamilyDuesResponse>(
      `/api/church-management/fees/family/${familyId}/dues${qs}`
    );
  },

  async generateFamilyDues(
    familyId: string,
    year: number,
    dueTypeId?: string,
    personIds?: string[]
  ) {
    return apiClient.post<{ created: number; year: number; persons?: number | null }>(
      `/api/church-management/fees/family/${familyId}/generate`,
      { year, dueTypeId, ...(personIds ? { personIds } : {}) }
    );
  },

  async recordPreviousDuesPayment(
    personId: string,
    data: { amountPaid: number; paidDate?: string; comments?: string }
  ) {
    return apiClient.post<{
      message: string;
      amountPaid: number;
      remaining: number;
      previousDues: MembershipFeeStatus['previousDues'];
    }>(`/api/church-management/fees/previous-dues/${personId}/payment`, data);
  },

  async clearPreviousDues(personId: string, data?: { comments?: string }) {
    return apiClient.post<{
      message: string;
      previousDues: MembershipFeeStatus['previousDues'];
    }>(`/api/church-management/fees/previous-dues/${personId}/clear`, data ?? {});
  },

  async listPreviousDues(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<PreviousDuesListResponse>(
      `/api/church-management/fees/previous-dues${query}`
    );
  },

  async listAllDues(params: {
    year?: number;
    dueTypeId?: string;
    paid?: 'paid' | 'unpaid';
    search?: string;
    page?: number;
    limit?: number;
    /** Default person = one row per member. Use rows for raw month lines. */
    view?: 'person' | 'rows';
  }) {
    const qs = new URLSearchParams();
    if (params.year) qs.set('year', String(params.year));
    if (params.dueTypeId) qs.set('dueTypeId', params.dueTypeId);
    if (params.paid) qs.set('paid', params.paid);
    if (params.search) qs.set('search', params.search);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    qs.set('view', params.view ?? 'person');
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<DuesListResponse>(`/api/church-management/fees/dues${query}`);
  },

  async downloadDuesExcel(params: {
    year: number;
    dueTypeId?: string;
    paid?: 'paid' | 'unpaid' | '';
    search?: string;
  }) {
    const qs = new URLSearchParams();
    qs.set('year', String(params.year));
    qs.set('format', 'xlsx');
    qs.set('view', 'person');
    if (params.dueTypeId) qs.set('dueTypeId', params.dueTypeId);
    if (params.paid) qs.set('paid', params.paid);
    if (params.search) qs.set('search', params.search);
    await downloadChurchMgmtXlsx(
      `/api/church-management/fees/dues?${qs.toString()}`,
      `fees-dues-${params.year}.xlsx`
    );
  },

  async generateAllDues(year: number, dueTypeId?: string, personIds?: string[]) {
    return apiClient.post<{
      created: number;
      updated: number;
      year: number;
      amount: number;
      persons?: number;
    }>('/api/church-management/fees/generate-all', {
      year,
      dueTypeId,
      ...(personIds ? { personIds } : {}),
    });
  },

  /** Convert yearly membership placeholder into Jan–Dec month rows for one person. */
  async openMembershipMonths(personId: string, year: number) {
    return this.generateAllDues(year, undefined, [personId]);
  },

  async getPersonFeeStatus(personId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    return apiClient.get<MembershipFeeStatus>(
      `/api/church-management/fees/person/${personId}/status?year=${currentYear}`
    );
  },

  async getPersonFeeHistory(personId: string) {
    return apiClient.get<{
      dues: MemberDue[];
      payments: MembershipPaymentHistoryItem[];
      clearance?: Array<{
        dueId: string;
        dueType: string;
        dueCode?: string;
        year: number;
        remaining: number;
        label?: string | null;
        aggregated?: boolean;
      }>;
    }>(`/api/church-management/fees/person/${personId}/history`);
  },

  async getFamilyFeeSummary(familyId: string, year?: number) {
    const params = year ? `?year=${year}` : '';
    return apiClient.get<FamilyDuesResponse>(
      `/api/church-management/fees/family/${familyId}/summary${params}`
    );
  },

  async createOrUpdateDue(data: CreateDueRequest) {
    return apiClient.post<MemberDue>('/api/church-management/fees', data);
  },

  async recordPayment(feeId: string, data: RecordPaymentRequest) {
    return apiClient.patch<MemberDue>(`/api/church-management/fees/${feeId}/payment`, data);
  },

  async updateDue(feeId: string, data: UpdateDueRequest) {
    return apiClient.patch<MemberDue>(`/api/church-management/fees/${feeId}`, data);
  },

  async deleteDue(feeId: string) {
    return apiClient.delete(`/api/church-management/fees/${feeId}`);
  },
};
