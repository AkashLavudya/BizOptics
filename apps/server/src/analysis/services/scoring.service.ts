import { Injectable } from '@nestjs/common';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type OpportunityType =
  | 'WEBSITE_DEVELOPMENT'
  | 'WORKFLOW_AUTOMATION'
  | 'AI_AGENT'
  | 'COMBINATION_PACKAGE'
  | 'SEO_OPTIMIZATION'
  | 'REVIEW_MANAGEMENT';

const WEBSITE_WEIGHT = 0.35;
const AUTOMATION_WEIGHT = 0.35;
const AI_WEIGHT = 0.30;

@Injectable()
export class ScoringService {
  // ─── Calculate Final Score ─────────────────────────────────────────────────

  calculateFinalScore(
    websiteScore: number,
    automationScore: number,
    aiScore: number,
  ): number {
    const raw =
      websiteScore * WEBSITE_WEIGHT +
      automationScore * AUTOMATION_WEIGHT +
      aiScore * AI_WEIGHT;

    return Math.round(Math.min(100, Math.max(0, raw)));
  }

  // ─── Priority Level ────────────────────────────────────────────────────────

  getPriorityLevel(finalScore: number): PriorityLevel {
    if (finalScore >= 80) return 'CRITICAL';
    if (finalScore >= 60) return 'HIGH';
    if (finalScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  // ─── Opportunity Types ─────────────────────────────────────────────────────

  getOpportunityTypes(
    websiteScore: number,
    automationScore: number,
    aiScore: number,
  ): OpportunityType[] {
    const types: OpportunityType[] = [];

    // All three high → combination package is the best recommendation
    const allHigh =
      websiteScore > 50 && automationScore > 60 && aiScore > 60;
    if (allHigh) {
      types.push('COMBINATION_PACKAGE');
    }

    // Website development — low website score means opportunity to build / fix site
    if (websiteScore < 50) {
      types.push('WEBSITE_DEVELOPMENT');
    }

    // Workflow automation — significant automation need
    if (automationScore > 60) {
      types.push('WORKFLOW_AUTOMATION');
    }

    // AI agent — significant AI opportunity
    if (aiScore > 60) {
      types.push('AI_AGENT');
    }

    // SEO optimization — decent site but poor analytics / social proof (low score)
    if (websiteScore >= 20 && websiteScore < 60) {
      types.push('SEO_OPTIMIZATION');
    }

    // Review management — very high AI score driven by review volume
    if (aiScore > 70) {
      types.push('REVIEW_MANAGEMENT');
    }

    // Deduplicate while preserving order
    return [...new Set(types)];
  }
}
