import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../auth/repositories/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    
    const { password, refreshToken, emailVerificationToken, passwordResetToken, passwordResetExpiresAt, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; avatar?: string }) {
    const user = await this.userRepository.updateProfile(userId, data);
    const { password, refreshToken, emailVerificationToken, passwordResetToken, passwordResetExpiresAt, ...profile } = user;
    return profile;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('bcrypt.rounds', 12),
    );

    await this.userRepository.updatePassword(userId, hashedPassword);
    return { message: 'Password changed successfully' };
  }

  async getActivityStats(userId: string) {
    const [searchCount, totalBusinesses] = await Promise.all([
      this.prisma.searchHistory.count({ where: { userId } }),
      this.prisma.business.count(),
    ]);

    return {
      searchesPerformed: searchCount,
      totalBusinessesInSystem: totalBusinesses,
    };
  }
}
