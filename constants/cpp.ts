import { CPPStep, CPPUpsellTrigger } from '@/types/cpp';

// CPP Step Definitions
export const CPP_STEPS: CPPStep[] = [
  // Profile Steps (Lower weight, no verification required)
  {
    id: 'profile_completion',
    title: 'Complete Profile Information',
    description: 'Fill out all required profile fields including personal information, goals, and preferences.',
    category: 'profile',
    verificationType: 'profile_completion',
    weight: 5,
    requiresVerification: false,
    isRequired: true,
    estimatedTime: '10 minutes',
    tips: [
      'Ensure all information is accurate and up-to-date',
      'Add a professional profile picture',
      'Include relevant experience and achievements'
    ]
  },
  {
    id: 'email_confirmation',
    title: 'Confirm Email Address',
    description: 'Verify your email address to ensure you receive important updates and notifications.',
    category: 'profile',
    verificationType: 'email_confirmation',
    weight: 3,
    requiresVerification: false,
    isRequired: true,
    estimatedTime: '2 minutes',
    tips: [
      'Check your spam folder if you don\'t receive the confirmation email',
      'Use a professional email address'
    ]
  },
  {
    id: 'police_service_selection',
    title: 'Select Target Police Service',
    description: 'Specify which police service(s) you are applying to for personalized guidance.',
    category: 'profile',
    verificationType: 'police_service_selection',
    weight: 5,
    requiresVerification: false,
    isRequired: true,
    estimatedTime: '5 minutes',
    tips: [
      'Research multiple services to increase your chances',
      'Consider location, requirements, and culture',
      'You can update this selection later'
    ]
  },
  {
    id: 'document_verification',
    title: 'Upload Required Documents',
    description: 'Upload and verify essential documents like driver\'s license, education certificates, etc.',
    category: 'profile',
    verificationType: 'document_verification',
    weight: 8,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '15 minutes',
    tips: [
      'Ensure documents are clear and legible',
      'Include all required identification',
      'Keep documents organized and accessible'
    ],
    upsellMessage: 'Get document review and optimization tips with Premium!'
  },

  // Application Steps (Medium weight, some require verification)
  {
    id: 'application_prerequisites',
    title: 'Complete Prerequisites Review',
    description: 'Review and confirm you meet all basic requirements for police applications.',
    category: 'application',
    verificationType: 'ai_monitored_test',
    weight: 10,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '20 minutes',
    tips: [
      'Be honest about your qualifications',
      'Research specific requirements for your target services',
      'Address any gaps in your qualifications'
    ],
    upgradeRequired: true,
    upsellMessage: 'Unlock detailed prerequisites guide and strategies with Premium!'
  },
  {
    id: 'oacp_preparation',
    title: 'OACP Certificate Preparation',
    description: 'Complete comprehensive preparation for the OACP Certificate requirements.',
    category: 'application',
    verificationType: 'ai_monitored_test',
    weight: 15,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '2-3 hours',
    tips: [
      'Focus on both written and physical components',
      'Practice with sample questions',
      'Create a study schedule'
    ],
    upgradeRequired: true,
    upsellMessage: 'Access complete OACP prep materials and strategies with Premium!'
  },
  {
    id: 'interview_prep_test',
    title: 'Interview Preparation Test',
    description: 'Complete AI-monitored interview preparation test with human review.',
    category: 'application',
    verificationType: 'ai_monitored_test',
    weight: 12,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '45 minutes',
    tips: [
      'Practice the STAR method for answers',
      'Prepare examples for each competency',
      'Be honest and authentic in your responses'
    ],
    upgradeRequired: true,
    upsellMessage: 'Access comprehensive interview prep materials with Premium!'
  },
  {
    id: 'official_test_prep',
    title: 'Official Test Preparation',
    description: 'Complete preparation for official police service tests and assessments.',
    category: 'application',
    verificationType: 'ai_monitored_test',
    weight: 15,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '1-2 hours',
    tips: [
      'Focus on test-specific requirements',
      'Practice under timed conditions',
      'Review all test components thoroughly'
    ],
    upgradeRequired: true,
    upsellMessage: 'Get official test prep materials and strategies with Premium!'
  },

  // Fitness Steps (Higher weight, most require verification)
  {
    id: 'fitness_assessment',
    title: 'Initial Fitness Assessment',
    description: 'Complete a comprehensive fitness assessment to establish your baseline.',
    category: 'fitness',
    verificationType: 'in_person_pin_test',
    weight: 20,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '45 minutes',
    tips: [
      'Wear appropriate athletic clothing',
      'Warm up properly before testing',
      'Be honest about your current fitness level'
    ],
    upgradeRequired: true,
    upsellMessage: 'Book an in-person fitness assessment with certified instructors!'
  },
  {
    id: 'prep_test_practice',
    title: 'PREP Test Practice',
    description: 'Practice the Physical Readiness Evaluation for Police (PREP) test components.',
    category: 'fitness',
    verificationType: 'in_person_prep_test',
    weight: 25,
    requiresVerification: true,
    isRequired: true,
    estimatedTime: '1 hour',
    tips: [
      'Focus on shuttle run, push/pull machine, and obstacle course',
      'Practice the specific test layout',
      'Build both strength and endurance'
    ],
    upgradeRequired: true,
    upsellMessage: 'Book an in-person PREP test simulation with official equipment!'
  },
  {
    id: 'fitness_training_plan',
    title: 'Complete Fitness Training Plan',
    description: 'Follow a personalized training plan to improve your fitness test performance.',
    category: 'fitness',
    verificationType: 'ai_monitored_test',
    weight: 15,
    requiresVerification: false,
    isRequired: false,
    estimatedTime: '8-12 weeks',
    tips: [
      'Follow the plan consistently',
      'Track your progress regularly',
      'Adjust intensity as needed'
    ],
    upgradeRequired: true,
    upsellMessage: 'Unlock personalized training plans and progress tracking with Premium!'
  },
  {
    id: 'fitness_progress_test',
    title: 'Fitness Progress Assessment',
    description: 'Complete a progress assessment to measure your fitness improvements.',
    category: 'fitness',
    verificationType: 'in_person_pin_test',
    weight: 18,
    requiresVerification: true,
    isRequired: false,
    estimatedTime: '45 minutes',
    tips: [
      'Schedule regular progress assessments',
      'Compare results to your baseline',
      'Adjust training based on results'
    ],
    upgradeRequired: true,
    upsellMessage: 'Book a progress assessment with certified instructors!'
  }
];

// CPP Weights Configuration
export const CPP_WEIGHTS = {
  VERIFIED_MULTIPLIER: 2.0, // Verified completions get double weight
  UNVERIFIED_MULTIPLIER: 1.0, // Unverified completions get normal weight
  MAX_PERCENTAGE_WITHOUT_VERIFIED: 70, // Can't reach 100% without verified completions
  MIN_VERIFIED_FOR_100_PERCENT: 3, // Need at least 3 verified completions for 100%
} as const;

// Verification Allowance by Subscription Tier
export const VERIFICATION_ALLOWANCE = {
  free: {
    monthlyLimit: 0,
    canPurchaseMore: false,
    additionalPurchasePrice: 0,
  },
  premium: {
    monthlyLimit: 3,
    canPurchaseMore: true,
    additionalPurchasePrice: 19.99, // Per additional verification
  },
} as const;

// Upsell Triggers
export const CPP_UPSELL_TRIGGERS: CPPUpsellTrigger[] = [
  {
    id: 'low_verified_completions',
    title: 'Boost Your Progress',
    message: 'You need verified completions to reach 100% CPP. Upgrade to Premium for monthly verification allowances!',
    action: 'subscribe',
    priority: 'high',
    conditions: {
      maxVerifiedCompletions: 1,
      requiresSubscription: true,
    },
  },
  {
    id: 'verification_limit_reached',
    title: 'Verification Limit Reached',
    message: 'You\'ve used all your monthly verifications. Purchase more or wait until next month!',
    action: 'purchase_verification',
    priority: 'medium',
    conditions: {
      requiresSubscription: true,
    },
  },
  {
    id: 'fitness_verification_needed',
    title: 'Get Certified Fitness Assessment',
    message: 'Book an in-person fitness assessment with certified instructors for verified completion!',
    action: 'book_session',
    priority: 'medium',
    conditions: {
      minPercentage: 30,
    },
  },
  {
    id: 'prep_test_verification',
    title: 'Practice PREP Test Officially',
    message: 'Book an in-person PREP test simulation with official equipment and professional scoring!',
    action: 'book_session',
    priority: 'medium',
    conditions: {
      minPercentage: 50,
    },
  },
  {
    id: 'near_completion',
    title: 'Almost There!',
    message: 'You\'re close to 100% CPP! Complete a few more verified steps to reach your goal.',
    action: 'subscribe',
    priority: 'low',
    conditions: {
      minPercentage: 80,
    },
  },
];

// CPP Categories
export const CPP_CATEGORIES = {
  profile: {
    name: 'Profile Setup',
    color: '#3B82F6',
    icon: 'User',
  },
  application: {
    name: 'Application Process',
    color: '#10B981',
    icon: 'FileText',
  },
  fitness: {
    name: 'Fitness Preparation',
    color: '#F59E0B',
    icon: 'Dumbbell',
  },
  verification: {
    name: 'Verification',
    color: '#8B5CF6',
    icon: 'Shield',
  },
} as const;

// CPP Progress Messages
export const CPP_PROGRESS_MESSAGES = {
  excellent: {
    title: 'Excellent Progress!',
    message: 'You\'re making outstanding progress toward your police application goals.',
    color: '#10B981',
  },
  good: {
    title: 'Good Progress',
    message: 'You\'re on track with your preparation. Keep up the great work!',
    color: '#3B82F6',
  },
  fair: {
    title: 'Fair Progress',
    message: 'You\'re making progress, but consider focusing on verified completions.',
    color: '#F59E0B',
  },
  needs_improvement: {
    title: 'Needs Improvement',
    message: 'Focus on completing more steps, especially verified ones, to improve your CPP.',
    color: '#EF4444',
  },
} as const;

