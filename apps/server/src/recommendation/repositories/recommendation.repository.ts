import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert a recommendation keyed on analysisId (unique constraint).
   * This handles the one-to-one Analysis <-> Recommendation relationship
   * cleanly without unique-violation errors on re-analysis.
   */
  async upsertByAnalysisId(data: {
    businessId: string;
    analysisId: string;
    primaryOpportunity: string;
    recommendations: any;       // JSON array of recommendation objects
    totalEstimatedValue: string;
    notes?: string;
  }) {
    return this.prisma.recommendation.upsert({
      where: { analysisId: data.analysisId },
      create: {
        businessId: data.businessId,
        analysisId: data.analysisId,
        primaryOpportunity: data.primaryOpportunity,
        recommendations: data.recommendations,
        totalEstimatedValue: data.totalEstimatedValue,
        notes: data.notes,
      },
      update: {
        primaryOpportunity: data.primaryOpportunity,
        recommendations: data.recommendations,
        totalEstimatedValue: data.totalEstimatedValue,
        notes: data.notes,
        isActioned: false,
        actionedAt: null,
      },
    });
  }

  /** @deprecated Use upsertByAnalysisId instead */
  async create(data: {
    businessId: string;
    analysisId: string;
    primaryOpportunity: string;
    recommendations: any;
    totalEstimatedValue?: string;
    notes?: string;
  }) {
    return this.upsertByAnalysisId({
      ...data,
      totalEstimatedValue: data.totalEstimatedValue ?? '',
    });
  }

  async findById(id: string) {
    return this.prisma.recommendation.findUnique({
      where: { id },
      include: { business: true, analysis: true },
    });
  }

  async findByBusinessId(businessId: string) {
    return this.prisma.recommendation.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { analysis: true },
    });
  }

  async findByAnalysisId(analysisId: string) {
    return this.prisma.recommendation.findFirst({
      where: { analysisId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.recommendation.update({ where: { id }, data });
  }

  async markActioned(id: string) {
    return this.prisma.recommendation.update({
      where: { id },
      data: { isActioned: true, actionedAt: new Date() },
    });
  }
}
