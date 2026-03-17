export type MembershipTier = 'Standard' | 'Pro' | 'AI';
export type MemberStatus = 'ACTIVE' | 'AT_RISK' | 'INACTIVE';
export type InquiryStatus = 'Open' | 'Qualified' | 'Decision Pitch' | 'Converted';
export type ExpenseCategory = 'Rent' | 'Electricity' | 'Supplement Stock' | 'Staff' | 'Other';
export type TrainerShift = 'Morning' | 'Evening';
export type TrainerStatus = 'Active' | 'On Break';

export interface NutritionEntry {
  date: string;
  kCal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: MembershipTier;
  status: MemberStatus;
  lastCheckIn: string; // ISO string
  trainerId?: string;
  nutritionData: NutritionEntry[];
  downloadId?: string;
  subscriptionExpiry: string; // ISO string
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  membersAssigned: number;
  rating: number;
  shift: TrainerShift;
  status: TrainerStatus;
}

export interface Inquiry {
  id: string;
  name: string;
  contact: string;
  program: string;
  status: InquiryStatus;
  inquiryDate: string; // ISO string
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO string
}

export interface GymConfig {
  gymName: string;
  logoUrl: string;
  currency: string;
  pricing: Record<MembershipTier, number>;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
