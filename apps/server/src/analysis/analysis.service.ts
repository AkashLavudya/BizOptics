import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WebsiteAnalysisService } from './services/website-analysis.service';
import { AutomationAnalysisService } from './services/automation-analysis.service';
import { AIAgentAnalysisService } from './services/ai-agent-analysis.service';
import { ScoringService } from './services/scoring.service';
import { AnalysisRepository } from './repositories/analysis.repository';
import { RecommendationService } from '../recommendation/recommendation.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly websiteAnalysisService: WebsiteAnalysisService,
    private readonly automationAnalysisService: AutomationAnalysisService,
    private readonly aiAgentAnalysisService: AIAgentAnalysisService,
    private readonly scoringService: ScoringService,
    private readonly analysisRepository: AnalysisRepository,
    private readonly recommendationService: RecommendationService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Analyze Multiple Businesses ──────────────────────────────────────────

  async analyzeBusinesses(
    businessIds: string[],
  ): Promise<{ results: any[]; errors: string[] }> {
    const results: any[] = [];
    const errors: string[] = [];

    for (const businessId of businessIds) {
      try {
        const analysis = await this.analyzeBusiness(businessId);
        results.push(analysis);
      } catch (err) {
        const msg = `Failed to analyze business ${businessId}: ${(err as Error).message}`;
        this.logger.error(msg);
        errors.push(msg);
      }
    }

    return { results, errors };
  }

  // ─── Analyze Single Business ───────────────────────────────────────────────

  async analyzeBusiness(businessId: string): Promise<any> {
    // 1. Load business
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business ${businessId} not found.`);
    }

    this.logger.log(`Starting analysis for business: ${business.name} (${businessId})`);

    // 2. Run all three analyses in parallel
    const [websiteResult, automationResult, aiAgentResult] =
      await Promise.allSettled([
        this.websiteAnalysisService.analyze(business),
        this.automationAnalysisService.analyze(business),
        this.aiAgentAnalysisService.analyze(business),
      ]);

    const websiteAnalysis =
      websiteResult.status === 'fulfilled'
        ? websiteResult.value
        : this.websiteAnalysisService.getDefaultResult();

    const automationAnalysis =
      automationResult.status === 'fulfilled'
        ? automationResult.value
        : this.automationAnalysisService.getDefaultResult();

    const aiAgentAnalysis =
      aiAgentResult.status === 'fulfilled'
        ? aiAgentResult.value
        : this.aiAgentAnalysisService.getDefaultResult();

    if (websiteResult.status === 'rejected') {
      this.logger.warn(`Website analysis failed: ${websiteResult.reason}`);
    }
    if (automationResult.status === 'rejected') {
      this.logger.warn(`Automation analysis failed: ${automationResult.reason}`);
    }
    if (aiAgentResult.status === 'rejected') {
      this.logger.warn(`AI agent analysis failed: ${aiAgentResult.reason}`);
    }

    // 3. Score
    const websiteScore = websiteAnalysis.score;
    const automationScore = automationAnalysis.score;
    const aiScore = aiAgentAnalysis.score;

    const finalScore = this.scoringService.calculateFinalScore(
      websiteScore,
      automationScore,
      aiScore,
    );
    const priorityLevel = this.scoringService.getPriorityLevel(finalScore);
    const opportunityTypes = this.scoringService.getOpportunityTypes(
      websiteScore,
      automationScore,
      aiScore,
    );

    // 4. Persist analysis record
    const analysisRecord = await this.analysisRepository.create({
      businessId,
      websiteScore,
      automationScore,
      aiScore,
      finalScore,
      priorityLevel,
      opportunityTypes,

      // Flat Website analysis fields
      hasWebsite: websiteAnalysis.hasWebsite,
      websiteUrl: business.website || null,
      hasHttps: websiteAnalysis.isHttps,
      hasContactPage: websiteAnalysis.hasContactPage,
      hasBookingPage: websiteAnalysis.hasBookingPage,
      hasMobileOptimization: websiteAnalysis.hasMobileOptimization,
      hasAnalytics: websiteAnalysis.hasAnalytics,
      hasSocialProof: websiteAnalysis.hasSocialProof,
      pageLoadScore: 0,
      contentQualityScore: 0,

      // Flat Automation analysis fields
      needsAppointmentBooking: automationAnalysis.needsAppointmentBooking,
      needsLeadManagement: automationAnalysis.needsLeadManagement,
      needsInventoryManagement: automationAnalysis.needsInventoryManagement,
      needsCustomerFollowUp: automationAnalysis.needsCustomerFollowUp,
      needsInvoicing: automationAnalysis.needsInvoicing,
      needsReporting: automationAnalysis.needsReporting,
      manualWorkflowCount: 0,

      // Flat AI Agent analysis fields
      needsCustomerSupport: aiAgentAnalysis.needsCustomerSupport,
      needsFaqAutomation: aiAgentAnalysis.needsFaqAutomation,
      needsLeadQualification: aiAgentAnalysis.needsLeadQualification,
      needsAppointmentBot: aiAgentAnalysis.needsAppointmentBot,
      needsReviewManagement: aiAgentAnalysis.needsReviewManagement,
      customerInteractionVolume: aiAgentAnalysis.customerInteractionVolume,
    });

    this.logger.log(
      `Analysis complete for ${business.name}: final=${finalScore}, priority=${priorityLevel}`,
    );

    // 5. Trigger recommendations
    try {
      await this.recommendationService.generateRecommendations(
        business,
        analysisRecord,
      );
    } catch (err) {
      this.logger.warn(
        `Recommendation generation failed for business ${businessId}: ${(err as Error).message}`,
      );
    }

    return analysisRecord;
  }

  // ─── Get Analysis ─────────────────────────────────────────────────────────

  async getAnalysis(analysisId: string): Promise<any> {
    const analysis = await this.analysisRepository.findById(analysisId);
    if (!analysis) {
      throw new NotFoundException(`Analysis ${analysisId} not found.`);
    }
    return analysis;
  }

  // ─── Get Business Analyses ────────────────────────────────────────────────

  async getBusinessAnalyses(businessId: string): Promise<any[]> {
    return this.analysisRepository.findByBusinessId(businessId);
  }
}
