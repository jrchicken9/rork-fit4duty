export type CPPVerificationType = 
  | 'in_person_prep_test'
  | 'in_person_pin_test'
  | 'ai_monitored_test'
  | 'human_verified_test'
  | 'profile_completion'
  | 'email_confirmation'
  | 'document_verification'
  | 'police_service_selection'
  | 'interview_prep_test'
  | 'official_test_prep';

export type CPPCompletionStatus = 'verified' | 'unverified' | 'in_progress' | 'not_started';

export type CPPCompletion = {
  id: string;
  type: CPPVerificationType;
  status: CPPCompletionStatus;
  title: string;
  description: string;
  category: 'profile' | 'application' | 'fitness' | 'verification';
  weight: number; // Higher weight for verified completions
  verifiedAt?: Date;
  completedAt?: Date;
  metadata?: {
    score?: number;
    instructor?: string;
    location?: string;
    testType?: string;
    [key: string]: any;
  };
};

export type CPPProgress = {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  verifiedCompletions: number;
  unverifiedCompletions: number;
  totalCompletions: number;
  remainingVerifiedAllowance: number;
  monthlyVerifiedAllowance: number;
  nextResetDate: Date;
  completions: CPPCompletion[];
  lastUpdated: Date;
};

export type CPPVerificationAllowance = {
  monthlyLimit: number;
  usedThisMonth: number;
  remainingThisMonth: number;
  nextResetDate: Date;
  canPurchaseMore: boolean;
  additionalPurchasePrice: number;
};

export type CPPStep = {
  id: string;
  title: string;
  description: string;
  category: 'profile' | 'application' | 'fitness' | 'verification';
  verificationType: CPPVerificationType;
  weight: number;
  requiresVerification: boolean;
  isRequired: boolean;
  prerequisites?: string[];
  estimatedTime: string;
  tips: string[];
  upsellMessage?: string;
  upgradeRequired?: boolean;
};

export type CPPUpsellTrigger = {
  id: string;
  title: string;
  message: string;
  action: 'subscribe' | 'purchase_verification' | 'book_session';
  priority: 'low' | 'medium' | 'high';
  conditions: {
    minPercentage?: number;
    maxVerifiedCompletions?: number;
    requiresSubscription?: boolean;
  };
};

