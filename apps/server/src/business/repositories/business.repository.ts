import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BusinessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.business.create({ data });
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    city?: string;
    state?: string;
    minScore?: number;
    maxScore?: number;
    priorityLevel?: string;
    opportunityType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page, limit, search, category, city, state,
      minScore, maxScore, priorityLevel, sortBy = 'createdAt', sortOrder = 'desc',
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.BusinessWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      // category is an enum, try exact match
      where.category = category as any;
    }
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };

    // For score/priority filters we filter via analyses relation
    const analysisWhere: any = {};
    if (minScore !== undefined) analysisWhere.finalScore = { ...analysisWhere.finalScore, gte: minScore };
    if (maxScore !== undefined) analysisWhere.finalScore = { ...analysisWhere.finalScore, lte: maxScore };
    if (priorityLevel) analysisWhere.priorityLevel = priorityLevel;
    if (Object.keys(analysisWhere).length > 0) {
      where.analyses = { some: analysisWhere };
    }

    // Determine order by
    const validBusinessFields = ['name', 'createdAt', 'rating', 'reviewCount', 'city'];
    const orderBy: any = validBusinessFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: sortOrder };

    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { recommendation: true },
          },
          recommendations: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      this.prisma.business.count({ where }),
    ]);

    return { businesses, total };
  }

  async findById(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { recommendation: true },
        },
        recommendations: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findByGooglePlaceId(placeId: string) {
    return this.prisma.business.findUnique({
      where: { googlePlaceId: placeId },
    });
  }

  async upsertByGooglePlaceId(placeId: string, data: any) {
    // Explicitly map only fields that exist on the Prisma Business model
    const safeData = {
      name: data.name ?? 'Unknown',
      description: data.description ?? null,
      ownerName: data.ownerName ?? null,
      services: data.services ?? [],
      foundedYear: data.foundedYear ?? null,
      employeeCount: data.employeeCount ?? null,
      address: data.address ?? '',
      city: data.city ?? 'Unknown',
      state: data.state ?? 'Unknown',
      country: data.country ?? 'US',
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      category: data.category ?? 'OTHER',
      rating: data.rating ?? null,
      reviewCount: data.reviewCount ?? 0,
      priceLevel: data.priceLevel ?? null,
      photos: data.photos ?? [],
      types: data.types ?? [],
    };

    return this.prisma.business.upsert({
      where: { googlePlaceId: placeId },
      update: { ...safeData, updatedAt: new Date() },
      create: { ...safeData, googlePlaceId: placeId },
    });
  }


  async delete(id: string) {
    return this.prisma.business.delete({ where: { id } });
  }

  async count() {
    return this.prisma.business.count();
  }

  async getStats() {
    const [total, withWebsite, withoutWebsite, byCategory] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.business.count({ where: { website: { not: null } } }),
      this.prisma.business.count({ where: { website: null } }),
      this.prisma.business.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      withWebsite,
      withoutWebsite,
      byCategory: byCategory.map(g => ({
        category: g.category,
        count: g._count._all,
      })),
    };
  }

  async findTopByScore(limit = 10) {
    // Get businesses that have analyses with highest final score
    const analyses = await this.prisma.analysis.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { finalScore: 'desc' },
      take: limit,
      include: { business: true },
    });
    return analyses.map(a => ({ ...a.business, finalScore: a.finalScore, priorityLevel: a.priorityLevel }));
  }

  async getByCity() {
    return this.prisma.business.groupBy({
      by: ['city'],
      _count: { _all: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    });
  }
}
