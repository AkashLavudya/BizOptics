import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalBusinesses,
      totalAnalyses,
      completedAnalyses,
      websiteLeads,
      automationLeads,
      aiLeads,
      combinationLeads,
      newThisWeek,
      recentAnalyses,
    ] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.analysis.count(),
      this.prisma.analysis.count({ where: { status: 'COMPLETED' } }),
      this.prisma.analysis.count({
        where: {
          status: 'COMPLETED',
          websiteScore: { lt: 50 },
        },
      }),
      this.prisma.analysis.count({
        where: {
          status: 'COMPLETED',
          automationScore: { gte: 60 },
        },
      }),
      this.prisma.analysis.count({
        where: {
          status: 'COMPLETED',
          aiScore: { gte: 60 },
        },
      }),
      this.prisma.analysis.count({
        where: {
          status: 'COMPLETED',
          finalScore: { gte: 75 },
        },
      }),
      this.prisma.business.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.analysis.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { analyzedAt: 'desc' },
        take: 10,
        include: {
          business: {
            select: { name: true, city: true, category: true },
          },
        },
      }),
    ]);

    const analysisCompletionRate = totalAnalyses > 0
      ? Math.round((completedAnalyses / totalAnalyses) * 100)
      : 0;

    return {
      totalBusinesses,
      websiteLeads,
      automationLeads,
      aiLeads,
      combinationLeads,
      newBusinessesThisWeek: newThisWeek,
      analysisCompletionRate,
      recentAnalyses,
    };
  }

  async getBusinessesByCategory() {
    const result = await this.prisma.business.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return result.map(item => ({
      label: item.category.replace(/_/g, ' '),
      value: item._count.id,
    }));
  }

  async getOpportunitiesByType() {
    const [websiteLeads, automationLeads, aiLeads, combinationLeads] = await Promise.all([
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', websiteScore: { lt: 50 } },
      }),
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', automationScore: { gte: 60 } },
      }),
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', aiScore: { gte: 60 } },
      }),
      this.prisma.analysis.count({
        where: {
          status: 'COMPLETED',
          finalScore: { gte: 75 },
        },
      }),
    ]);

    return [
      { label: 'Website Development', value: websiteLeads },
      { label: 'Workflow Automation', value: automationLeads },
      { label: 'AI Agent', value: aiLeads },
      { label: 'Combination Package', value: combinationLeads },
    ];
  }

  async getScoreDistribution() {
    const [critical, high, medium, low] = await Promise.all([
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', priorityLevel: 'CRITICAL' },
      }),
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', priorityLevel: 'HIGH' },
      }),
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', priorityLevel: 'MEDIUM' },
      }),
      this.prisma.analysis.count({
        where: { status: 'COMPLETED', priorityLevel: 'LOW' },
      }),
    ]);

    return [
      { label: 'Critical (90+)', value: critical },
      { label: 'High (75-89)', value: high },
      { label: 'Medium (50-74)', value: medium },
      { label: 'Low (0-49)', value: low },
    ];
  }

  async getTrendsOverTime(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const businesses = await this.prisma.business.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    businesses.forEach(b => {
      const date = b.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, value]) => ({ date, label: date, value }));
  }

  async getTopOpportunities(limit: number = 10) {
    const analyses = await this.prisma.analysis.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { finalScore: 'desc' },
      take: limit,
      include: {
        business: true,
        recommendation: true,
      },
    });

    return analyses.map(a => ({
      businessId: a.businessId,
      businessName: a.business.name,
      city: a.business.city,
      category: a.business.category,
      finalScore: a.finalScore,
      priorityLevel: a.priorityLevel,
      opportunityTypes: a.opportunityTypes,
      websiteScore: a.websiteScore,
      automationScore: a.automationScore,
      aiScore: a.aiScore,
      recommendation: a.recommendation,
    }));
  }

  async getFullAnalytics() {
    const [
      stats,
      businessesByCategory,
      opportunitiesByType,
      scoreDistribution,
      trendsOverTime,
      topOpportunities,
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getBusinessesByCategory(),
      this.getOpportunitiesByType(),
      this.getScoreDistribution(),
      this.getTrendsOverTime(30),
      this.getTopOpportunities(10),
    ]);

    return {
      stats,
      businessesByCategory,
      opportunitiesByType,
      scoreDistribution,
      trendsOverTime,
      topOpportunities,
    };
  }

  async resetAllData() {
    return this.prisma.$transaction(async (tx) => {
      await tx.recommendation.deleteMany({});
      await tx.analysis.deleteMany({});
      await tx.searchHistory.deleteMany({});
      await tx.business.deleteMany({});
      return { success: true, message: 'All business and scanning data has been successfully reset.' };
    });
  }
}
