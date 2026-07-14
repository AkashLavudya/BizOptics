import { UserRole, UserStatus, BusinessCategory, OpportunityType, PriorityLevel, AnalysisStatus } from './enums';

// ============================================================
// USER TYPES
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// ============================================================
// BUSINESS TYPES
// ============================================================

export interface BusinessLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

export interface BusinessContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface BusinessBase {
  id: string;
  name: string;
  category: BusinessCategory;
  location: BusinessLocation;
  contact: BusinessContact;
  googlePlaceId?: string;
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessWithScores extends BusinessBase {
  websiteScore?: number;
  automationScore?: number;
  aiScore?: number;
  finalScore?: number;
  priorityLevel?: PriorityLevel;
  opportunityTypes?: OpportunityType[];
}

// ============================================================
// ANALYSIS TYPES
// ============================================================

export interface WebsiteAnalysisResult {
  hasWebsite: boolean;
  websiteUrl?: string;
  hasHttps: boolean;
  hasContactPage: boolean;
  hasBookingPage: boolean;
  hasMobileOptimization: boolean;
  hasAnalytics: boolean;
  hasSocialProof: boolean;
  pageLoadScore: number;
  contentQualityScore: number;
  score: number;
}

export interface AutomationAnalysisResult {
  needsAppointmentBooking: boolean;
  needsLeadManagement: boolean;
  needsInventoryManagement: boolean;
  needsCustomerFollowUp: boolean;
  needsInvoicing: boolean;
  needsReporting: boolean;
  manualWorkflowCount: number;
  score: number;
}

export interface AIAgentAnalysisResult {
  needsCustomerSupport: boolean;
  needsFAQAutomation: boolean;
  needsLeadQualification: boolean;
  needsAppointmentBot: boolean;
  needsReviewManagement: boolean;
  customerInteractionVolume: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
}

export interface AnalysisResult {
  id: string;
  businessId: string;
  status: AnalysisStatus;
  websiteAnalysis?: WebsiteAnalysisResult;
  automationAnalysis?: AutomationAnalysisResult;
  aiAgentAnalysis?: AIAgentAnalysisResult;
  websiteScore: number;
  automationScore: number;
  aiScore: number;
  finalScore: number;
  priorityLevel: PriorityLevel;
  analyzedAt?: Date;
  createdAt: Date;
}

// ============================================================
// RECOMMENDATION TYPES
// ============================================================

export interface RecommendationDetail {
  opportunityType: OpportunityType;
  title: string;
  description: string;
  estimatedValue: string;
  priority: PriorityLevel;
  reasons: string[];
  actionItems: string[];
}

export interface RecommendationResult {
  id: string;
  businessId: string;
  analysisId: string;
  recommendations: RecommendationDetail[];
  primaryOpportunity: OpportunityType;
  totalEstimatedValue: string;
  createdAt: Date;
}

// ============================================================
// SEARCH TYPES
// ============================================================

export interface SearchQuery {
  query: string;
  location?: string;
  radius?: number;
  category?: BusinessCategory;
  limit?: number;
}

export interface SearchResult {
  businesses: BusinessBase[];
  total: number;
  searchId: string;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface DashboardStats {
  totalBusinesses: number;
  websiteLeads: number;
  automationLeads: number;
  aiLeads: number;
  totalRevenuePotential: string;
  newBusinessesThisWeek: number;
  analysisCompletionRate: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface AnalyticsData {
  stats: DashboardStats;
  businessesByCategory: ChartDataPoint[];
  opportunitiesByType: ChartDataPoint[];
  scoreDistribution: ChartDataPoint[];
  trendsOverTime: ChartDataPoint[];
}

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================
// API RESPONSE
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
