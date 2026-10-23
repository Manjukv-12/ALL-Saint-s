// API Types
export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface ApiInfo {
  message: string;
  version: string;
  endpoints: {
    health: string;
    admin: string;
    family: string;
    public: string;
  };
  documentation: string;
}

// Admin Types
export interface Admin {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  lastLoginAt?: string;
  /** Hard-coded super-admin email in backend config; can change locked membership rates. */
  isSuperAdmin?: boolean;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: Admin;
}

// Family Types
export interface Family {
  id: string;
  familyCode: string;
  /** Traditional house / veedu name. */
  houseName?: string | null;
  address?: string;
  /** CSI parish area (built-in list or a custom area saved on the family). */
  area?: string | null;
  /** Church cemetery tomb booked for this family. */
  tombBooked?: boolean | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SEPARATED' | 'DECEASED';
  headOfFamilyId?: string;
  parentFamilyId?: string;
  rootFamilyId?: string;
  generation?: number;
  members?: Member[];
  parentFamily?: {
    id: string;
    familyCode: string;
    headOfFamilyId?: string;
  };
  rootFamily?: {
    id: string;
    familyCode: string;
    headOfFamilyId?: string;
  };
  childFamilies?: Array<{
    id: string;
    familyCode: string;
    headOfFamilyId?: string;
    createdAt: string;
  }>;
  lineageInfo?: {
    parentFamily?: {
      id: string;
      familyCode: string;
    };
    rootFamily?: {
      id: string;
      familyCode: string;
    };
    childFamilies?: Array<{
      id: string;
      familyCode: string;
      createdAt: string;
    }>;
    lineagePath?: Array<{ id: string; familyCode: string }>;
    isRootFamily: boolean;
    generationLevel: 'root' | 'descendant';
    splitHistory?: Array<{
      personId: string;
      personName: string;
      fromFamilyId: string;
      fromFamilyCode: string;
      toFamilyId: string;
      toFamilyCode: string;
      reason: string;
      splitDate: string;
      notes?: string;
    }>;
  };
  formerMembers?: FormerFamilyMember[];
  familyAccount?: {
    id: string;
    uid: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
  };
  feeSummary?: {
    year?: number;
    totalPaid: number;
    totalUnpaid: number;
    totalAmount: number;
    membersPaid: number;
    membersUnpaid: number;
    totalMembers: number;
  };
  _count?: {
    members: number;
    activeMembers?: number;
    certificates: number;
    membershipFees: number;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface FormerFamilyMember {
  personId: string;
  fullName: string;
  gender?: 'MALE' | 'FEMALE';
  contactNumber?: string;
  membershipType?: MembershipType;
  relationship?: string;
  personStatus?: 'Active' | 'Separated' | 'Deceased' | 'Divorced';
  currentFamilyId?: string;
  currentFamilyCode?: string;
  leaveReason: 'FAMILY_SPLIT' | 'MARRIAGE_OUT' | 'DEATH' | 'STATUS_CHANGE' | 'DIVORCE_RETURN';
  leaveLabel: string;
  eventDate?: string;
  notes?: string;
  toFamilyId?: string;
  toFamilyCode?: string;
  spouseName?: string;
}

export type MembershipType = 'FULL' | 'ASSOCIATE';

export interface CreateFamilyRequest {
  /** Assigned by the backend as FAM001, FAM002, ... */
  familyCode?: string;
  /** Traditional house / veedu name. */
  houseName?: string;
  address?: string;
  /** Required when creating a family — choose from the list or enter a new area. */
  area: string;
  hofName: string;
  hofGender: 'MALE' | 'FEMALE';
  hofDob?: string;
  hofDow?: string;
  hofDateOfBaptism?: string;
  hofDateOfConfirmation?: string;
  hofRelationship?: string;
  hofStatus?: 'Active' | 'Separated' | 'Deceased' | 'Divorced';
  occupation?: string;
  qualification?: string;
  contact?: string;
  bloodGroup?: string;
  hofMembershipFeeAmount?: number;
  hofMembershipType?: MembershipType;
  hofAssociateJoinDate?: string;
  hofAssociateLeftDate?: string;
  tombBooked?: boolean | null;
  hofYearOfJoining?: number;
  hofJoinYearTo?: number;
  hofBirthYearFrom?: number;
  hofBirthYearTo?: number;
  /** New family becomes parent household above this root (UUID). */
  linkAsParentOfRootFamilyId?: string;
  /** New family is a branch under this root (UUID). */
  linkUnderRootFamilyId?: string;
}

export interface Member {
  id: string;
  familyId: string;
  fullName: string;
  relationship?: string;
  relationshipToHOF?: string;
  dateOfBirth?: string;
  dateOfWedding?: string;
  dateOfBaptism?: string;
  dateOfConfirmation?: string;
  occupation?: string;
  qualification?: string;
  bloodGroup?: string;
  contactNumber?: string;
  /** Stored upload filename (person-*.jpg|png|webp), optional. */
  photo?: string | null;
  isHeadOfFamily: boolean;
  gender?: 'MALE' | 'FEMALE';
  status?: 'Active' | 'Separated' | 'Deceased' | 'Divorced';
  membershipStatus?: 'Active' | 'Moved To' | 'Married To' | 'Divorced' | 'Deceased';
  movedFromFamily?: {
    id: string;
    familyCode: string;
  };
  movedToFamily?: {
    id: string;
    familyCode: string;
  };
  movedAt?: string;
  membershipType?: MembershipType;
  yearOfJoining?: number | null;
  joinYearTo?: number | null;
  birthYearFrom?: number | null;
  birthYearTo?: number | null;
  associateJoinDate?: string;
  associateLeftDate?: string;
  membershipFeeAmount?: number | null;
  /** Manual arrears through previousDuesThroughYear (separate from fee rows). */
  hasPreviousDues?: boolean;
  previousDuesAmount?: number | null;
  previousDuesNotes?: string | null;
  previousDuesThroughYear?: number;
  maritalStatus?: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  spouseName?: string;
  marriageDate?: string;
  externalFamilyAddress?: string;
  externalFamilyName?: string;
  relatedFamilyId?: string;
  marriedToFamily?: {
    id: string;
    familyCode: string;
    address?: string;
  };
  statusNotes?: string;
  statusChangedAt?: string;
  membershipFees?: Array<{
    id: string;
    year: number;
    amount: number;
    amountDue?: number;
    amountPaid?: number;
    paid: boolean;
    paidDate?: string;
    dueTypeId?: string;
    dueType?: {
      id: string;
      code: string;
      name: string;
    };
    comments?: string | null;
    month?: number | null;
  }>;
  subscriptionStatus?: {
    state: 'NO_FEE' | 'UNPAID' | 'PAID';
    eligible?: boolean;
    amount?: number;
    amountDue?: number;
    amountPaid?: number;
    year?: number;
    paidDate?: string;
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
    suggestedPayments?: Array<{ label: string; months: number; amount: number }>;
    paidUntil?: { year: number; month: number; label: string } | null;
    paidUntilLabel?: string | null;
    nextDueMonth?: {
      year: number;
      month: number;
      label: string;
      remaining?: number;
    } | null;
  };
  /** All unpaid dues to church: membership through this month + other assigned dues. */
  duesOutstanding?: {
    membershipOutstanding: number;
    otherOutstanding: number;
    totalOutstanding: number;
  };
  family?: {
    id: string;
    familyCode: string;
    area?: string | null;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type LifeEventType =
  | 'MARRIAGE_OUT'
  | 'FAMILY_SPLIT'
  | 'DEATH'
  | 'DIVORCE_RETURN'
  | 'STATUS_CHANGE';

export interface LifeEvent {
  id: string;
  personId: string;
  familyId: string;
  eventType: LifeEventType;
  eventDate: string;
  notes: string;
  spouseName?: string;
  externalFamilyAddress?: string;
  relatedFamilyId?: string;
  relatedFamilyCode?: string;
  fromFamilyId?: string;
  toFamilyId?: string;
  fromFamilyCode?: string;
  toFamilyCode?: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: string;
}

export interface PersonProfile {
  person: Member;
  currentFamily: Family;
  birthFamilyId: string;
  createdFamilies: Family[];
  lifeEvents: LifeEvent[];
  relatedMembers: Member[];
  canSplitFamily: boolean;
  canMarkMarried: boolean;
  canMarkDeceased: boolean;
  canReturnHome: boolean;
  /** Set on mark-deceased response when head-of-family succession runs. */
  deathSuccession?: {
    applied: boolean;
    newHeadId?: string | null;
    newHeadName?: string | null;
    familyStatus: string;
    requiresManualHof?: boolean;
    message: string;
  };
}

export interface CreateMemberRequest {
  familyId: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  relationship?: string;
  dob?: string;
  dow?: string;
  dobBaptism?: string;
  dateOfBaptism?: string;
  dobConfirmation?: string;
  dateOfConfirmation?: string;
  occupation?: string;
  qualification?: string;
  bloodGroup?: string;
  phone?: string; // Maps to contactNumber in backend
  contactNumber?: string; // Alternative field name
  isHeadOfFamily?: boolean;
  status?: 'Active' | 'Separated' | 'Deceased' | 'Divorced';
  maritalStatus?: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  spouseName?: string;
  membershipType?: MembershipType;
  yearOfJoining?: number;
  joinYearTo?: number;
  associateJoinDate?: string;
  associateLeftDate?: string;
  membershipFeeAmount?: number | null;
  statusNotes?: string;
  hasPreviousDues?: boolean;
  previousDuesAmount?: number | null;
  previousDuesNotes?: string | null;
}

// Public Types
export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

