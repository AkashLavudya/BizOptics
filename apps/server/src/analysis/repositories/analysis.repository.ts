import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalysisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    // Mark analysis COMPLETED immediately on creation
    return this.prisma.analysis.create({
      data: {
        ...data,
        status: 'COMPLETED',
        analyzedAt: new Date(),
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.analysis.update({ where: { id }, data });
  }

  async findById(id: string) {
    return this.prisma.analysis.findUnique({
      where: { id },
      include: { business: true, recommendation: true },
    });
  }

  async findByBusinessId(businessId: string) {
    return this.prisma.analysis.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { recommendation: true },
    });
  }

  async findLatestByBusinessId(businessId: string) {
    return this.prisma.analysis.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { recommendation: true },
    });
  }
}
