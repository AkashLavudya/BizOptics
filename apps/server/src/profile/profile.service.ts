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

  async saveApiKey(userId: string, googlePlacesApiKey: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { googlePlacesApiKey: googlePlacesApiKey.trim() || null },
    });
    return {
      message: googlePlacesApiKey.trim()
        ? 'API key saved successfully'
        : 'API key removed',
      hasKey: !!googlePlacesApiKey.trim(),
    };
  }

  async getApiKeyStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googlePlacesApiKey: true },
    });
    const key = user?.googlePlacesApiKey;
    return {
      hasKey: !!key,
      // Return masked version so UI can show it was set (e.g. "AIza••••••••••••Xk9r")
      maskedKey: key ? `${key.slice(0, 6)}${'•'.repeat(20)}${key.slice(-4)}` : null,
    };
  }

  async getApiKey(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { googlePlacesApiKey: true },
    });
    return user?.googlePlacesApiKey ?? null;
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
