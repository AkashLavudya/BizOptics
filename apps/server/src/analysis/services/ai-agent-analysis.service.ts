import { Injectable, Logger } from '@nestjs/common';

export type CustomerInteractionVolume = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIAgentAnalysisResult {
  needsCustomerSupport: boolean;
  needsFaqAutomation: boolean;
  needsLeadQualification: boolean;
  needsAppointmentBot: boolean;
  needsReviewManagement: boolean;
  customerInteractionVolume: CustomerInteractionVolume;
  score: number;
  details: {
    category?: string;
    reviewCount?: number;
    reasoning: string[];
  };
}

// ─── Category Sets ──────────────────────────────────────────────────────────

/** High customer-service volume categories */
const HIGH_SUPPORT_CATEGORIES = new Set([
  'RESTAURANT',
  'RETAIL',
  'HOSPITALITY',
  'HEALTHCARE',
  'TELECOMMUNICATIONS',
  'E_COMMERCE',
  'AUTOMOTIVE',
]);

/** FAQ-heavy categories (lots of pre-purchase / pre-visit questions) */
const FAQ_CATEGORIES = new Set([
  'HEALTHCARE',
  'LEGAL',
  'FINANCIAL_SERVICES',
  'REAL_ESTATE',
  'EDUCATION',
  'INSURANCE',
  'DENTAL',
  'VETERINARY',
]);

/** Lead qualification matters most here */
const LEAD_QUALIFICATION_CATEGORIES = new Set([
  'LEGAL',
  'REAL_ESTATE',
  'FINANCIAL_SERVICES',
  'INSURANCE',
  'CONSULTING',
  'MARKETING',
  'MORTGAGE',
  'IT_SERVICES',
]);

/** Appointment bot useful for these categories */
const APPOINTMENT_BOT_CATEGORIES = new Set([
  'HEALTHCARE',
  'BEAUTY_SALON',
  'FITNESS',
  'LEGAL',
  'DENTAL',
  'VETERINARY',
  'MENTAL_HEALTH',
  'REAL_ESTATE',
  'AUTOMOTIVE',
]);

@Injectable()
export class AIAgentAnalysisService {
  private readonly logger = new Logger(AIAgentAnalysisService.name);

  // ─── Main Entry Point ──────────────────────────────────────────────────────

  analyze(business: any): AIAgentAnalysisResult {
    const category: string = (business.category ?? '').toUpperCase();
    const reviewCount: number = business.reviewCount ?? 0;
    const reasoning: string[] = [];

    // Customer Support — high volume categories OR many reviews signals high traffic
    const needsCustomerSupport =
      HIGH_SUPPORT_CATEGORIES.has(category) || reviewCount > 100;
    if (needsCustomerSupport) {
      reasoning.push(
        `${category} businesses receive high inbound queries — a 24/7 AI support agent reduces response time and staff load.`,
      );
    }

    // FAQ Automation — knowledge-heavy industries
    const needsFaqAutomation = FAQ_CATEGORIES.has(category);
    if (needsFaqAutomation) {
      reasoning.push(
        `${category} clients frequently ask the same pre-visit questions — an AI FAQ bot handles these automatically.`,
      );
    }

    // Lead Qualification
    const needsLeadQualification = LEAD_QUALIFICATION_CATEGORIES.has(category);
    if (needsLeadQualification) {
      reasoning.push(
        `${category} businesses can use AI to qualify leads before they reach a human agent, improving conversion rates.`,
      );
    }

    // Appointment Bot
    const needsAppointmentBot = APPOINTMENT_BOT_CATEGORIES.has(category);
    if (needsAppointmentBot) {
      reasoning.push(
        `An AI appointment bot enables ${category} businesses to book clients 24/7 without receptionist involvement.`,
      );
    }

    // Review Management — worth investing when review count is significant
    const needsReviewManagement = reviewCount > 50;
    if (needsReviewManagement) {
      reasoning.push(
        `With ${reviewCount} reviews, this business benefits from AI-driven review monitoring and response automation.`,
      );
    }

    const customerInteractionVolume =
      this.getCustomerInteractionVolume(reviewCount);

    const result: AIAgentAnalysisResult = {
      needsCustomerSupport,
      needsFaqAutomation,
      needsLeadQualification,
      needsAppointmentBot,
      needsReviewManagement,
      customerInteractionVolume,
      score: 0,
      details: { category, reviewCount, reasoning },
    };

    result.score = this.calculateScore(result);
    return result;
  }

  // ─── Default / Fallback Result ─────────────────────────────────────────────

  getDefaultResult(): AIAgentAnalysisResult {
    return {
      needsCustomerSupport: false,
      needsFaqAutomation: false,
      needsLeadQualification: false,
      needsAppointmentBot: false,
      needsReviewManagement: false,
      customerInteractionVolume: 'LOW',
      score: 0,
      details: { reasoning: ['Default fallback result.'] },
    };
  }

  // ─── Customer Interaction Volume ──────────────────────────────────────────

  private getCustomerInteractionVolume(
    reviewCount: number,
  ): CustomerInteractionVolume {
    if (reviewCount > 200) return 'HIGH';
    if (reviewCount > 50) return 'MEDIUM';
    return 'LOW';
  }

  // ─── Score Calculation ────────────────────────────────────────────────────

  calculateScore(result: AIAgentAnalysisResult): number {
    const weights: Array<[boolean, number]> = [
      [result.needsCustomerSupport, 25],
      [result.needsFaqAutomation, 20],
      [result.needsLeadQualification, 25],
      [result.needsAppointmentBot, 20],
      [result.needsReviewManagement, 10],
    ];

    const base = weights.reduce(
      (sum, [flag, weight]) => sum + (flag ? weight : 0),
      0,
    );

    // Volume bonus
    const volumeBonus: Record<CustomerInteractionVolume, number> = {
      LOW: 0,
      MEDIUM: 5,
      HIGH: 10,
    };

    return Math.min(100, base + volumeBonus[result.customerInteractionVolume]);
  }
}
