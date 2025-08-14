export type ApplicationStep = {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  tips: string[];
  estimatedTime: string;
  resources: {
    title: string;
    url: string;
    isPremium?: boolean;
  }[];
  nextSteps: string[];
  fitnessFeatures?: {
    practiceSessions?: boolean;
    trainingPlans?: boolean;
  };
  premiumFeatures?: {
    detailedGuide?: boolean;
    videoTutorials?: boolean;
    expertTips?: boolean;
    mockInterview?: boolean;
    documentReview?: boolean;
  };
  // New monetization structure
  monetization: {
    freePreview: {
      intro: string;
      tips: string[];
      basicGuidance: string;
    };
    premiumUpgrade: {
      title: string;
      description: string;
      features: string[];
      price?: number; // Monthly subscription price
    };
    oneTimeServices?: {
      id: string;
      title: string;
      description: string;
      price: number;
      features: string[];
      popular?: boolean;
    }[];
  };
};

const applicationSteps: ApplicationStep[] = [
  {
    id: "prerequisites",
    title: "Prerequisites",
    description: "Essential requirements and qualifications needed before starting your police application journey.",
    requirements: [
      "Be at least 18 years of age",
      "Be a Canadian citizen or permanent resident",
      "Have a valid driver's license",
      "Have completed high school or equivalent",
      "Have no criminal convictions for which a pardon has not been granted",
    ],
    tips: [
      "Start gathering official documents early",
      "Research specific requirements for your target police services",
      "Consider volunteer work to strengthen your application",
    ],
    estimatedTime: "1-2 months preparation",
    resources: [
      {
        title: "Official Requirements Guide",
        url: "https://www.oacp.ca/",
      },
    ],
    nextSteps: ["oacp"],
    monetization: {
      freePreview: {
        intro: "Get started with the essential requirements for police applications in Ontario.",
        tips: [
          "Ensure you meet all basic eligibility criteria",
          "Start collecting official documents early",
          "Research specific requirements for your target services"
        ],
        basicGuidance: "Most police services require the same basic qualifications, but some may have additional requirements."
      },
      premiumUpgrade: {
        title: "Complete Prerequisites Guide",
        description: "Unlock comprehensive unwritten requirements, timelines, and strategies to strengthen your application.",
        features: [
          "Detailed unwritten requirements guide",
          "Timeline optimization strategies",
          "Application strengthening techniques",
          "Service-specific requirement breakdowns",
          "Document preparation checklists"
        ]
      },
      oneTimeServices: []
    },
  },
  {
    id: "oacp",
    title: "OACP Certificate",
    description: "The Ontario Association of Chiefs of Police (OACP) Certificate is a requirement for most police services in Ontario.",
    requirements: [
      "Complete written test",
      "Pass physical test",
      "Submit required documentation",
      "Pay application fees",
    ],
    tips: [
      "Apply for the OACP Certificate well in advance",
      "Prepare thoroughly for each component",
      "Keep all documentation organized",
    ],
    estimatedTime: "2-3 months",
    resources: [
      {
        title: "OACP Official Website",
        url: "https://www.oacp.ca/",
      },
      {
        title: "OACP Certificate Application",
        url: "https://www.oacpcertificate.ca/",
      },
    ],
    nextSteps: ["pre-application-prep"],
    monetization: {
      freePreview: {
        intro: "Learn about the OACP Certificate process and what it involves.",
        tips: [
          "The OACP Certificate is required for most Ontario police services",
          "The process includes written and physical components",
          "Apply early as processing can take several months"
        ],
        basicGuidance: "The OACP Certificate is your first major step toward becoming a police officer in Ontario."
      },
      premiumUpgrade: {
        title: "OACP Prep Masterclass",
        description: "Access comprehensive OACP preparation guides, strategies, and study tools.",
        features: [
          "Complete OACP prep guides",
          "Study strategies and techniques",
          "Practice test materials",
          "Timeline optimization",
          "Expert tips and insights"
        ]
      },
      oneTimeServices: []
    },
  },
  {
    id: "pre-application-prep",
    title: "Pre-Application Prep",
    description: "Strategic preparation to maximize your chances of success before submitting applications.",
    requirements: [
      "Research target police services",
      "Prepare resume and cover letter",
      "Gather references",
      "Complete volunteer work",
      "Network with current officers",
    ],
    tips: [
      "Apply to multiple police services",
      "Tailor your resume for each service",
      "Build strong professional relationships",
      "Document all relevant experience",
    ],
    estimatedTime: "3-6 months",
    resources: [
      {
        title: "Police Service Research Guide",
        url: "#",
      },
    ],
    nextSteps: ["application"],
    monetization: {
      freePreview: {
        intro: "Quick readiness tips and timeline overview for your police application.",
        tips: [
          "Research multiple police services to increase your chances",
          "Start building your professional network early",
          "Document all relevant experience and achievements"
        ],
        basicGuidance: "Proper preparation can significantly improve your application success rate."
      },
      premiumUpgrade: {
        title: "Complete Prep Strategy",
        description: "Unlock full preparation plans, networking strategies, and reference-building techniques.",
        features: [
          "Comprehensive prep plans",
          "Networking strategies",
          "Volunteer opportunity guides",
          "Reference-building techniques",
          "Resume optimization strategies"
        ]
      },
      oneTimeServices: []
    },
  },
  {
    id: "application",
    title: "Application",
    description: "Submit your application to your chosen police service(s) with all required documentation.",
    requirements: [
      "Completed application form",
      "OACP Certificate",
      "Resume and cover letter",
      "Educational transcripts",
      "References",
      "Driver's abstract",
      "First Aid/CPR certification (if required)",
    ],
    tips: [
      "Apply to multiple police services",
      "Tailor your resume and cover letter",
      "Follow up on your application",
      "Keep copies of all submitted documents",
    ],
    estimatedTime: "1-2 weeks preparation",
    resources: [
      {
        title: "Ontario Provincial Police Careers",
        url: "https://www.opp.ca/index.php?id=115",
      },
      {
        title: "Toronto Police Service Careers",
        url: "https://www.torontopolice.on.ca/careers/",
      },
    ],
    nextSteps: ["prep-fitness-test"],
    fitnessFeatures: {
      practiceSessions: true,
      trainingPlans: true,
    },
    monetization: {
      freePreview: {
        intro: "Overview of the application process and essential tips for success.",
        tips: [
          "Apply to multiple police services to increase your chances",
          "Ensure all documents are complete and accurate",
          "Follow up on your application after submission"
        ],
        basicGuidance: "A well-prepared application package is crucial for advancing to the next stages."
      },
      premiumUpgrade: {
        title: "Application Mastery Guide",
        description: "Access detailed application breakdown, common pitfalls, and best practices.",
        features: [
          "Detailed application breakdown",
          "Common pitfalls to avoid",
          "Best practices guide",
          "Document optimization tips",
          "Follow-up strategies"
        ]
      },
      oneTimeServices: [
        {
          id: "document-review",
          title: "Document/Application Review",
          description: "Get your police service application package reviewed by certified instructors with detailed feedback.",
          price: 99.99,
          features: [
            "Comprehensive document review",
            "Detailed feedback and recommendations",
            "Improvement suggestions",
            "48-hour turnaround",
            "Follow-up consultation"
          ],
          popular: true
        }
      ]
    },
  },
  {
    id: "prep-fitness-test",
    title: "PREP Fitness Test",
    description: "The Physical Readiness Evaluation for Police (PREP) test assesses your physical abilities required for police work.",
    requirements: [
      "Complete the shuttle run to level 6.5",
      "Complete the push/pull machine (70 lbs force)",
      "Complete the obstacle course in under 2:42",
      "Wear appropriate athletic clothing and footwear",
    ],
    tips: [
      "Train specifically for each component",
      "Practice the obstacle course layout",
      "Focus on both strength and cardiovascular endurance",
      "Get plenty of rest before the test day",
    ],
    estimatedTime: "Test takes approximately 20-30 minutes",
    resources: [
      {
        title: "PREP Test Overview",
        url: "https://www.oacpcertificate.ca/physical-test/",
      },
      {
        title: "PREP Test Training Guide",
        url: "https://www.oacpcertificate.ca/wp-content/uploads/2020/01/PREP-Applicant-Preparation-Guide.pdf",
      },
    ],
    nextSteps: ["lfi-interview"],
    fitnessFeatures: {
      practiceSessions: true,
      trainingPlans: true,
    },
    monetization: {
      freePreview: {
        intro: "Description of the PREP test, basic tips, and sample exercises to get you started.",
        tips: [
          "The PREP test includes shuttle run, push/pull machine, and obstacle course",
          "Train specifically for each component",
          "Practice the obstacle course layout if possible"
        ],
        basicGuidance: "Physical fitness is a critical component of police work and the PREP test."
      },
      premiumUpgrade: {
        title: "Complete PREP Training Program",
        description: "Access full fitness prep program, tracking, and pass probability analysis.",
        features: [
          "Complete fitness prep program",
          "Progress tracking tools",
          "Pass probability analysis",
          "Personalized training plans",
          "Video tutorials and demonstrations"
        ]
      },
      oneTimeServices: [
        {
          id: "prep-practice-test",
          title: "In-Person PREP Practice Test",
          description: "Book a realistic PREP test simulation with official equipment and professional scoring.",
          price: 89.99,
          features: [
            "Realistic test simulation",
            "Official equipment usage",
            "Professional scoring and feedback",
            "Multiple locations available",
            "45-minute session"
          ],
          popular: true
        }
      ]
    },
  },
  {
    id: "lfi-interview",
    title: "Local Focus Interview (LFI)",
    description: "The Law Enforcement Interview assesses your suitability for police work through structured questioning.",
    requirements: [
      "Professional attire",
      "Knowledge of the police service",
      "Understanding of policing principles",
      "Prepared answers to common questions",
    ],
    tips: [
      "Research the specific police service thoroughly",
      "Practice with mock interviews",
      "Prepare examples of your relevant experiences",
      "Be honest and authentic in your responses",
    ],
    estimatedTime: "2-3 weeks preparation",
    resources: [
      {
        title: "Common Police Interview Questions",
        url: "https://www.policeprep.com/Police-Interview-Questions.html",
      },
    ],
    nextSteps: ["eci-panel-interview"],
    monetization: {
      freePreview: {
        intro: "Overview of LFI format and sample questions to help you understand the process.",
        tips: [
          "The LFI focuses on your suitability for police work",
          "Prepare examples from your life experiences",
          "Research the specific police service you're applying to"
        ],
        basicGuidance: "The LFI is your first major interview in the police application process."
      },
      premiumUpgrade: {
        title: "Interview Vault",
        description: "Access a large library of sample questions, answer frameworks, and strategies.",
        features: [
          "Large question bank",
          "Answer frameworks and strategies",
          "Sample responses",
          "Interview techniques",
          "Confidence-building exercises"
        ]
      },
      oneTimeServices: [
        {
          id: "recorded-mock-interview",
          title: "Recorded Mock Interview Review",
          description: "Record your answers to preset questions and get detailed feedback within 48 hours.",
          price: 79.99,
          features: [
            "Preset question bank",
            "Video recording guidance",
            "Detailed feedback within 48h",
            "Improvement recommendations",
            "Follow-up support"
          ]
        }
      ]
    },
  },
  {
    id: "eci-panel-interview",
    title: "ECI/Panel Interview",
    description: "The Essential Competency Interview (ECI) or panel interview assesses your competencies through structured behavioral questions.",
    requirements: [
      "Professional attire",
      "STAR method preparation",
      "Competency-based examples",
      "Understanding of police competencies",
    ],
    tips: [
      "Use the STAR method for answers",
      "Prepare examples for each competency",
      "Practice with mock interviews",
      "Demonstrate your commitment to public service",
    ],
    estimatedTime: "3-4 weeks preparation",
    resources: [
      {
        title: "STAR Method Guide",
        url: "#",
      },
    ],
    nextSteps: ["background-check"],
    monetization: {
      freePreview: {
        intro: "Overview of panel interview structure and what to expect during the ECI process.",
        tips: [
          "The ECI uses the STAR method for answers",
          "Prepare examples for each competency area",
          "Practice with mock interviews to build confidence"
        ],
        basicGuidance: "The ECI is a critical step that assesses your essential competencies for police work."
      },
      premiumUpgrade: {
        title: "Complete ECI Prep Pack",
        description: "Access full ECI preparation with STAR/LEO answer techniques and model responses.",
        features: [
          "STAR/LEO answer techniques",
          "Model responses for each competency",
          "Practice scenarios",
          "Confidence-building exercises",
          "Interview simulation tools"
        ]
      },
      oneTimeServices: [
        {
          id: "custom-question-pack",
          title: "Custom Interview Question Pack",
          description: "Get a tailored list of likely questions for your chosen police service.",
          price: 59.99,
          features: [
            "Service-specific questions",
            "Tailored to your background",
            "Answer guidance",
            "Priority questions list",
            "Preparation timeline"
          ]
        }
      ]
    },
  },
  {
    id: "background-check",
    title: "Background Check",
    description: "A thorough investigation of your background, including criminal history, employment history, and reference checks.",
    requirements: [
      "Provide accurate information on all forms",
      "Disclose all required information honestly",
      "Provide contact information for references",
      "Consent to background investigation",
    ],
    tips: [
      "Be completely honest about your history",
      "Inform your references that they may be contacted",
      "Address any potential issues proactively",
      "Be patient as this process can take time",
    ],
    estimatedTime: "1-3 months",
    resources: [
      {
        title: "Background Check Information",
        url: "https://www.oacp.ca/en/careers/background-checks.aspx",
      },
    ],
    nextSteps: ["final-steps"],
    monetization: {
      freePreview: {
        intro: "Overview of background investigation process and typical timelines.",
        tips: [
          "Be completely honest about your history",
          "Inform your references they may be contacted",
          "Address any potential issues proactively"
        ],
        basicGuidance: "The background check is thorough and can take several months to complete."
      },
      premiumUpgrade: {
        title: "Background Check Preparation Guide",
        description: "Access comprehensive guide to gathering references, preparing documents, and avoiding red flags.",
        features: [
          "Reference gathering strategies",
          "Document preparation guides",
          "Red flag avoidance tips",
          "Timeline optimization",
          "Follow-up strategies"
        ]
      },
      oneTimeServices: []
    },
  },
  {
    id: "final-steps",
    title: "Final Steps",
    description: "Final review of your application, potential job offer, and preparation for police college.",
    requirements: [
      "Successfully complete all previous steps",
      "Accept job offer if extended",
      "Prepare for police college training",
    ],
    tips: [
      "Respond promptly to any final requests",
      "Begin preparing physically and mentally for police college",
      "Organize your personal affairs before training begins",
      "Stay in touch with your recruitment contact",
    ],
    estimatedTime: "2-4 weeks",
    resources: [
      {
        title: "Ontario Police College",
        url: "https://www.opconline.ca/",
      },
    ],
    nextSteps: [],
    monetization: {
      freePreview: {
        intro: "Brief overview of final job offer process and onboarding preparation.",
        tips: [
          "Respond promptly to any final requests for information",
          "Begin preparing physically and mentally for police college",
          "Organize your personal affairs before training begins"
        ],
        basicGuidance: "The final steps lead to your job offer and preparation for police college."
      },
      premiumUpgrade: {
        title: "Academy Readiness Guide",
        description: "Access comprehensive guidance on academy readiness, gear checklist, and first-week survival tips.",
        features: [
          "Academy readiness checklist",
          "Gear and equipment guides",
          "First-week survival tips",
          "Physical preparation plans",
          "Mental preparation strategies"
        ]
      },
      oneTimeServices: []
    },
  },
];

export default applicationSteps;