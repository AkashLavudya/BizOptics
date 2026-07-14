// ============================================================
// ENUMS
// ============================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ANALYST = 'ANALYST',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum BusinessCategory {
  RESTAURANT = 'RESTAURANT',
  RETAIL = 'RETAIL',
  HEALTHCARE = 'HEALTHCARE',
  BEAUTY_SALON = 'BEAUTY_SALON',
  FITNESS = 'FITNESS',
  LEGAL = 'LEGAL',
  ACCOUNTING = 'ACCOUNTING',
  REAL_ESTATE = 'REAL_ESTATE',
  AUTOMOTIVE = 'AUTOMOTIVE',
  CONSTRUCTION = 'CONSTRUCTION',
  EDUCATION = 'EDUCATION',
  HOSPITALITY = 'HOSPITALITY',
  FINANCIAL_SERVICES = 'FINANCIAL_SERVICES',
  CONSULTING = 'CONSULTING',
  TECHNOLOGY = 'TECHNOLOGY',
  MANUFACTURING = 'MANUFACTURING',
  LOGISTICS = 'LOGISTICS',
  OTHER = 'OTHER',
}

export enum OpportunityType {
  WEBSITE_DEVELOPMENT = 'WEBSITE_DEVELOPMENT',
  WORKFLOW_AUTOMATION = 'WORKFLOW_AUTOMATION',
  AI_AGENT = 'AI_AGENT',
  COMBINATION_PACKAGE = 'COMBINATION_PACKAGE',
}

export enum PriorityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
