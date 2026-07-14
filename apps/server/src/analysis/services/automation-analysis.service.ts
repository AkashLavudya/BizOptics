import { Injectable, Logger } from '@nestjs/common';

export interface AutomationAnalysisResult {
  needsAppointmentBooking: boolean;
  needsLeadManagement: boolean;
  needsInventoryManagement: boolean;
  needsCustomerFollowUp: boolean;
  needsInvoicing: boolean;
  needsReporting: boolean;
  score: number;
  details: {
    category?: string;
    reasoning: string[];
  };
}

// ─── Category Sets ──────────────────────────────────────────────────────────

const APPOINTMENT_CATEGORIES = new Set([
  'HEALTHCARE',
  'BEAUTY_SALON',
  'FITNESS',
  'LEGAL',
  'REAL_ESTATE',
  'AUTOMOTIVE',
  'VETERINARY',
  'DENTAL',
  'MENTAL_HEALTH',
]);

const LEAD_MANAGEMENT_CATEGORIES = new Set([
  'LEGAL',
  'REAL_ESTATE',
  'CONSULTING',
  'FINANCIAL_SERVICES',
  'INSURANCE',
  'MORTGAGE',
  'MARKETING',
]);

const INVENTORY_CATEGORIES = new Set([
  'RETAIL',
  'RESTAURANT',
  'AUTOMOTIVE',
  'PHARMACY',
  'GROCERY',
  'WHOLESALE',
]);

const INVOICING_CATEGORIES = new Set([
  'LEGAL',
  'ACCOUNTING',
  'CONSULTING',
  'CONSTRUCTION',
  'IT_SERVICES',
  'FREELANCE',
  'FINANCIAL_SERVICES',
  'MARKETING',
]);

@Injectable()
export class AutomationAnalysisService {
  private readonly logger = new Logger(AutomationAnalysisService.name);

  // ─── Main Entry Point ──────────────────────────────────────────────────────

  analyze(business: any): AutomationAnalysisResult {
    const category: string = (business.category ?? '').toUpperCase();
    const reasoning: string[] = [];

    const needsAppointmentBooking = APPOINTMENT_CATEGORIES.has(category);
    if (needsAppointmentBooking) {
      reasoning.push(
        `${category} businesses heavily rely on appointment scheduling — automation prevents double-bookings and reduces no-shows.`,
      );
    }

    const needsLeadManagement = LEAD_MANAGEMENT_CATEGORIES.has(category);
    if (needsLeadManagement) {
      reasoning.push(
        `${category} businesses have complex lead pipelines that benefit from automated CRM workflows.`,
      );
    }

    const needsInventoryManagement = INVENTORY_CATEGORIES.has(category);
    if (needsInventoryManagement) {
      reasoning.push(
        `${category} businesses handle physical goods — automated inventory tracking reduces stockouts and waste.`,
      );
    }

    // Always true — all businesses benefit from customer follow-up automation
    const needsCustomerFollowUp = true;
    reasoning.push(
      'Automated post-visit / post-purchase follow-up increases retention and review rates for any business.',
    );

    const needsInvoicing = INVOICING_CATEGORIES.has(category);
    if (needsInvoicing) {
      reasoning.push(
        `${category} businesses issue frequent invoices — automation eliminates manual billing errors and accelerates cash flow.`,
      );
    }

    // Always true — data-driven reporting benefits every business
    const needsReporting = true;
    reasoning.push(
      'Automated reporting dashboards provide real-time KPIs without manual data aggregation.',
    );

    const result: AutomationAnalysisResult = {
      needsAppointmentBooking,
      needsLeadManagement,
      needsInventoryManagement,
      needsCustomerFollowUp,
      needsInvoicing,
      needsReporting,
      score: 0,
      details: { category, reasoning },
    };

    result.score = this.calculateScore(result);
    return result;
  }

  // ─── Default / Fallback Result ─────────────────────────────────────────────

  getDefaultResult(): AutomationAnalysisResult {
    return {
      needsAppointmentBooking: false,
      needsLeadManagement: false,
      needsInventoryManagement: false,
      needsCustomerFollowUp: true,
      needsInvoicing: false,
      needsReporting: true,
      score: 20,
      details: { reasoning: ['Default fallback result.'] },
    };
  }

  // ─── Score Calculation ────────────────────────────────────────────────────

  calculateScore(result: AutomationAnalysisResult): number {
    // Each automation need contributes a weighted portion to the score.
    // Higher score = more automation opportunity = higher business value for the prospect.
    const weights: Array<[boolean, number]> = [
      [result.needsAppointmentBooking, 20],
      [result.needsLeadManagement, 20],
      [result.needsInventoryManagement, 15],
      [result.needsCustomerFollowUp, 20],
      [result.needsInvoicing, 15],
      [result.needsReporting, 10],
    ];

    return weights.reduce(
      (sum, [flag, weight]) => sum + (flag ? weight : 0),
      0,
    );
  }
}
