import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RecommendationRepository } from './repositories/recommendation.repository';

export type RecommendationType =
  | 'WEBSITE_DEVELOPMENT'
  | 'WORKFLOW_AUTOMATION'
  | 'AI_AGENT'
  | 'COMBINATION_PACKAGE'
  | 'SEO_OPTIMIZATION'
  | 'REVIEW_MANAGEMENT';

interface RecommendationItem {
  type: RecommendationType;
  priority: number;
  title: string;
  description: string;
  reasons: string[];
  actionItems: string[];
  estimatedImpact: string;
  estimatedTimeToImplement: string;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly recommendationRepository: RecommendationRepository,
  ) {}

  // ─── Generate Recommendations ─────────────────────────────────────────────
  // All recommendation types are collected into a single JSON array and saved
  // as ONE record per analysis (matching the @unique analysisId constraint).

  async generateRecommendations(
    business: any,
    analysis: any,
  ): Promise<any> {
    const items: RecommendationItem[] = [];

    const websiteScore: number = analysis.websiteScore ?? 0;
    const automationScore: number = analysis.automationScore ?? 0;
    const aiScore: number = analysis.aiScore ?? 0;

    const allHigh = websiteScore > 50 && automationScore > 60 && aiScore > 60;

    // ── 1. Combination Package ──────────────────────────────────────────────
    if (allHigh) {
      items.push({
        type: 'COMBINATION_PACKAGE',
        priority: 1,
        title: 'Full Digital Transformation Package',
        description:
          'This business scores highly across website quality, automation needs, and AI agent potential. ' +
          'A bundled package combining web development, workflow automation, and AI agents will deliver ' +
          'maximum ROI and competitive advantage.',
        reasons: [
          `Website score (${websiteScore}/100) shows existing digital presence ripe for enhancement.`,
          `Automation score (${automationScore}/100) indicates multiple manual processes that can be streamlined.`,
          `AI agent score (${aiScore}/100) signals high customer interaction volume ideal for AI augmentation.`,
        ],
        actionItems: [
          'Redesign and optimise website with modern CMS and booking integration.',
          'Implement appointment scheduling, lead CRM, and automated follow-up workflows.',
          'Deploy customer support AI chatbot and FAQ automation.',
          'Set up review request automation post-service.',
          'Integrate analytics dashboard for real-time KPI tracking.',
        ],
        estimatedImpact: '40–70% reduction in manual admin time; 20–35% increase in lead conversion.',
        estimatedTimeToImplement: '6–10 weeks',
      });
    }

    // ── 2. Website Development ──────────────────────────────────────────────
    if (websiteScore < 50) {
      items.push({
        type: 'WEBSITE_DEVELOPMENT',
        priority: allHigh ? 2 : 1,
        title: 'Website Development & Optimisation',
        description:
          `${business.name} has a website score of ${websiteScore}/100, indicating significant gaps in online presence. ` +
          'A professional website with modern features will increase discoverability and trust.',
        reasons: [
          websiteScore === 0
            ? 'Business has no website — missing out on the majority of local digital search traffic.'
            : `Current website scores ${websiteScore}/100, indicating missing HTTPS, mobile responsiveness, or analytics.`,
          'Customers increasingly research businesses online before visiting in person.',
          'Competitors with better websites capture leads this business is currently losing.',
        ],
        actionItems: [
          websiteScore === 0
            ? 'Build a new professional website from scratch.'
            : 'Audit and rebuild the existing website with modern standards.',
          'Implement HTTPS and SSL certificate.',
          'Ensure full mobile responsiveness (viewport meta, responsive CSS).',
          'Add Google Analytics or Google Tag Manager for traffic tracking.',
          'Create dedicated Contact and About pages.',
          'Integrate online booking or appointment request form.',
          'Add testimonials and social proof section.',
        ],
        estimatedImpact: '50–120% increase in organic website traffic; 15–30% improvement in lead generation.',
        estimatedTimeToImplement: '3–5 weeks',
      });
    }

    // ── 3. Workflow Automation ──────────────────────────────────────────────
    if (automationScore > 60) {
      items.push({
        type: 'WORKFLOW_AUTOMATION',
        priority: allHigh ? 3 : 1,
        title: 'Business Workflow Automation',
        description:
          `${business.name} has an automation opportunity score of ${automationScore}/100. ` +
          'Several critical business processes can be automated, saving hours of manual work each week.',
        reasons: [
          'Manual scheduling leads to booking conflicts and missed appointments.',
          'Manual follow-up is inconsistent — automation ensures every lead is nurtured.',
          `${business.category ?? 'This type of'} businesses typically spend 15–25 hours/week on admin tasks that can be automated.`,
        ],
        actionItems: [
          'Set up automated appointment booking with calendar sync (Google Calendar / Outlook).',
          'Implement automated appointment reminder emails and SMS 24h before each booking.',
          'Create automated customer follow-up sequences after each visit/purchase.',
          'Set up lead capture forms with automatic CRM entry and follow-up triggers.',
          'Automate invoice generation and payment reminders.',
          'Build KPI reporting dashboard with weekly automated email summary.',
        ],
        estimatedImpact: '10–20 hours saved per week; 25–40% reduction in no-shows.',
        estimatedTimeToImplement: '2–4 weeks',
      });
    }

    // ── 4. AI Agent ─────────────────────────────────────────────────────────
    if (aiScore > 60) {
      items.push({
        type: 'AI_AGENT',
        priority: allHigh ? 4 : 1,
        title: 'AI Agent & Chatbot Implementation',
        description:
          `${business.name} has an AI opportunity score of ${aiScore}/100, indicating high customer interaction ` +
          'volume and complex pre-sale questions. AI agents will handle enquiries 24/7.',
        reasons: [
          'Customers expect instant responses — AI agents provide sub-second replies around the clock.',
          'High review count signals large customer base with recurring support queries.',
          `${business.category ?? 'Businesses in this sector'} commonly receive repetitive FAQ enquiries that AI handles perfectly.`,
        ],
        actionItems: [
          'Deploy AI-powered live chat widget on website.',
          'Train AI agent with business FAQs, pricing, hours, and policies.',
          'Integrate AI chatbot with booking system for seamless appointment scheduling.',
          'Set up automated review request messages after service completion.',
          'Implement AI lead qualification bot to pre-screen enquiries before human handoff.',
          'Configure escalation paths for complex queries that require human attention.',
        ],
        estimatedImpact: '70% of customer queries resolved without human intervention; 24/7 availability.',
        estimatedTimeToImplement: '2–3 weeks',
      });
    }

    // ── 5. SEO Optimisation ─────────────────────────────────────────────────
    if (websiteScore >= 20 && websiteScore < 60) {
      items.push({
        type: 'SEO_OPTIMIZATION',
        priority: 5,
        title: 'Local SEO & Search Visibility',
        description:
          'Improving local search engine optimisation will drive more organic traffic from nearby customers actively looking for services.',
        reasons: [
          '46% of all Google searches are local — ranking in the top 3 captures the majority of these clicks.',
          'Existing website provides a foundation to optimise with minimal cost.',
          'Competitors may already be investing in local SEO.',
        ],
        actionItems: [
          'Claim and fully optimise Google Business Profile.',
          'Implement structured data (Schema.org LocalBusiness markup).',
          'Add location-specific landing pages for each service.',
          'Build local citations on Yelp, Bing Places, and industry directories.',
          'Implement meta title and description optimisation for all pages.',
          'Create content marketing strategy targeting local keywords.',
        ],
        estimatedImpact: '30–80% increase in local organic search impressions within 3 months.',
        estimatedTimeToImplement: '4–6 weeks (ongoing)',
      });
    }

    // ── 6. Review Management ────────────────────────────────────────────────
    if (aiScore > 70) {
      items.push({
        type: 'REVIEW_MANAGEMENT',
        priority: 6,
        title: 'Review Management & Reputation Automation',
        description:
          "With a high volume of customer interactions, automated review management will protect and enhance this business's online reputation.",
        reasons: [
          'Businesses that actively manage reviews see up to 20% higher revenue.',
          'Automated review requests increase review volume by 200–400%.',
          'Responding to negative reviews within 24h significantly reduces their impact on reputation.',
        ],
        actionItems: [
          'Implement automated post-service review request via SMS and email.',
          'Set up review monitoring across Google, Yelp, and Facebook.',
          'Create response templates for positive and negative reviews.',
          'Build reputation dashboard to track sentiment trends over time.',
          'Integrate review widgets on website to showcase social proof.',
        ],
        estimatedImpact: '3–5× increase in monthly review volume; improved overall star rating.',
        estimatedTimeToImplement: '1–2 weeks',
      });
    }

    // ── Fallback: always generate at least one recommendation ───────────────
    if (items.length === 0) {
      items.push({
        type: 'WEBSITE_DEVELOPMENT',
        priority: 1,
        title: 'Digital Presence Audit',
        description:
          `${business.name} has been identified as a potential opportunity. ` +
          'An initial digital presence audit will reveal quick wins across website, automation, and AI.',
        reasons: [
          'Every business can benefit from a digital audit to identify untapped opportunities.',
          'Early-stage recommendations help prioritise highest-ROI improvements first.',
        ],
        actionItems: [
          'Conduct a full digital presence audit.',
          'Review website performance, mobile-friendliness, and contact forms.',
          'Assess current use of social media and review platforms.',
          'Identify top 3 automation opportunities for immediate implementation.',
        ],
        estimatedImpact: 'Identify 3–5 actionable quick wins within the first 2 weeks.',
        estimatedTimeToImplement: '1–2 weeks',
      });
    }

    // ── Save ALL items as one record (upsert handles re-analysis) ───────────
    const primaryType = items[0]?.type ?? 'WEBSITE_DEVELOPMENT';
    const totalImpact = items
      .map(r => r.estimatedImpact)
      .join(' | ');

    try {
      const saved = await this.recommendationRepository.upsertByAnalysisId({
        businessId: business.id,
        analysisId: analysis.id,
        primaryOpportunity: primaryType,
        recommendations: items,          // full array stored in JSON column
        totalEstimatedValue: totalImpact,
        notes: `${items.length} recommendation(s) generated`,
      });

      this.logger.log(
        `Saved ${items.length} recommendation(s) for business ${business.id} (${business.name})`,
      );
      return saved;
    } catch (err) {
      this.logger.error(
        `Failed to save recommendations for business ${business.id}: ${(err as Error).message}`,
      );
      throw err;
    }
  }

  // ─── Get Recommendation ───────────────────────────────────────────────────

  async getRecommendation(recommendationId: string): Promise<any> {
    const rec = await this.recommendationRepository.findById(recommendationId);
    if (!rec) throw new NotFoundException(`Recommendation ${recommendationId} not found.`);
    return rec;
  }

  // ─── Get Business Recommendations ────────────────────────────────────────

  async getBusinessRecommendations(businessId: string): Promise<any[]> {
    return this.recommendationRepository.findByBusinessId(businessId);
  }

  // ─── Mark Actioned ────────────────────────────────────────────────────────

  async markActioned(recommendationId: string): Promise<any> {
    const rec = await this.recommendationRepository.findById(recommendationId);
    if (!rec) throw new NotFoundException(`Recommendation ${recommendationId} not found.`);
    return this.recommendationRepository.markActioned(recommendationId);
  }
}
