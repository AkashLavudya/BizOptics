import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../auth/repositories/user.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async getUsers(params: { page: number; limit: number; search?: string; role?: string; status?: string }) {
    const { users, total } = await this.userRepository.findAll(params);
    const totalPages = Math.ceil(total / params.limit);
    return {
      data: users,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const { password, refreshToken, emailVerificationToken, passwordResetToken, ...profile } = user;
    return profile;
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.updateUserRole(userId, role);
  }

  async updateUserStatus(userId: string, status: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.updateUserStatus(userId, status);
  }

  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      adminCount,
      analystCount,
      totalBusinesses,
      totalAnalyses,
      completedAnalyses,
      totalRecommendations,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'ANALYST' } }),
      this.prisma.business.count(),
      this.prisma.analysis.count(),
      this.prisma.analysis.count({ where: { status: 'COMPLETED' } }),
      this.prisma.recommendation.count(),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, admins: adminCount, analysts: analystCount },
      businesses: { total: totalBusinesses },
      analyses: { total: totalAnalyses, completed: completedAnalyses },
      recommendations: { total: totalRecommendations },
      recentAuditLogs,
    };
  }

  async getAuditLogs(params: { page: number; limit: number; userId?: string; action?: string; entity?: string }) {
    const { page, limit, userId, action, entity } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entity) where.entity = { contains: entity, mode: 'insensitive' };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: logs,
      meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
