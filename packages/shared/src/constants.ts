// ============================================================
// APPLICATION CONSTANTS
// ============================================================

export const APP_NAME = 'BizOptics';
export const APP_DESCRIPTION = 'Business Opportunity Intelligence Platform';
export const APP_VERSION = '1.0.0';

// ============================================================
// SCORING CONSTANTS
// ============================================================

export const SCORE_WEIGHTS = {
  WEBSITE: 0.35,
  AUTOMATION: 0.35,
  AI_AGENT: 0.30,
} as const;

export const SCORE_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 50,
  HIGH: 70,
  CRITICAL: 85,
} as const;

// ============================================================
// PRIORITY LEVEL THRESHOLDS
// ============================================================

export const PRIORITY_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

// ============================================================
// BUSINESS CATEGORY AUTOMATION LIKELIHOOD
// ============================================================

export const AUTOMATION_LIKELIHOOD: Record<string, number> = {
  RESTAURANT: 75,
  RETAIL: 70,
  HEALTHCARE: 85,
  BEAUTY_SALON: 80,
  FITNESS: 75,
  LEGAL: 65,
  ACCOUNTING: 70,
  REAL_ESTATE: 80,
  AUTOMOTIVE: 70,
  CONSTRUCTION: 60,
  EDUCATION: 75,
  HOSPITALITY: 85,
  FINANCIAL_SERVICES: 70,
  CONSULTING: 65,
  TECHNOLOGY: 50,
  MANUFACTURING: 65,
  LOGISTICS: 80,
  OTHER: 60,
};

// ============================================================
// AI AGENT LIKELIHOOD
// ============================================================

export const AI_AGENT_LIKELIHOOD: Record<string, number> = {
  RESTAURANT: 80,
  RETAIL: 75,
  HEALTHCARE: 85,
  BEAUTY_SALON: 80,
  FITNESS: 70,
  LEGAL: 60,
  ACCOUNTING: 60,
  REAL_ESTATE: 75,
  AUTOMOTIVE: 70,
  CONSTRUCTION: 55,
  EDUCATION: 80,
  HOSPITALITY: 90,
  FINANCIAL_SERVICES: 65,
  CONSULTING: 60,
  TECHNOLOGY: 55,
  MANUFACTURING: 60,
  LOGISTICS: 70,
  OTHER: 60,
};

// ============================================================
// PAGINATION DEFAULTS
// ============================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================================
// JWT CONFIG
// ============================================================

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES: '15m',
  REFRESH_TOKEN_EXPIRES: '7d',
} as const;

// ============================================================
// CACHE TTL (seconds)
// ============================================================

export const CACHE_TTL = {
  ANALYTICS: 300,       // 5 minutes
  BUSINESS_LIST: 60,    // 1 minute
  BUSINESS_DETAIL: 120, // 2 minutes
  SEARCH_RESULTS: 300,  // 5 minutes
} as const;

// ============================================================
// GOOGLE PLACES CONFIG
// ============================================================

export const GOOGLE_PLACES = {
  BASE_URL: 'https://maps.googleapis.com/maps/api',
  DEFAULT_RADIUS: 5000,
  MAX_RESULTS: 60,
  SEARCH_TYPES: [
    'establishment',
    'point_of_interest',
  ],
} as const;

// ============================================================
// ESTIMATED VALUES BY OPPORTUNITY TYPE
// ============================================================

export const ESTIMATED_VALUES = {
  WEBSITE_DEVELOPMENT: {
    LOW: '$1,500 - $3,000',
    MEDIUM: '$3,000 - $8,000',
    HIGH: '$8,000 - $20,000',
    CRITICAL: '$20,000+',
  },
  WORKFLOW_AUTOMATION: {
    LOW: '$2,000 - $5,000',
    MEDIUM: '$5,000 - $15,000',
    HIGH: '$15,000 - $40,000',
    CRITICAL: '$40,000+',
  },
  AI_AGENT: {
    LOW: '$1,000 - $3,000',
    MEDIUM: '$3,000 - $10,000',
    HIGH: '$10,000 - $25,000',
    CRITICAL: '$25,000+',
  },
  COMBINATION_PACKAGE: {
    LOW: '$5,000 - $10,000',
    MEDIUM: '$10,000 - $30,000',
    HIGH: '$30,000 - $75,000',
    CRITICAL: '$75,000+',
  },
} as const;
