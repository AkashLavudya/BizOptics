import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from './repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.get<number>('bcrypt.rounds', 12),
    );

    const verificationToken = uuidv4();

    const user = await this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      emailVerificationToken: verificationToken,
      status: 'ACTIVE', // Auto-activate for demo; set to PENDING_VERIFICATION for production
      emailVerifiedAt: new Date(), // Auto-verify for demo
    });

    // Send verification email (non-blocking)
    this.mailService.sendVerificationEmail(user.email, user.firstName, verificationToken).catch(err => {
      this.logger.error('Failed to send verification email:', err);
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User registered: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Contact support.');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Your account is inactive. Contact support.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);
    await this.userRepository.updateLastLogin(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async logout(userId: string) {
    await this.userRepository.updateRefreshToken(userId, null);
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Access denied - invalid refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return { tokens };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Return success even if user not found (security)
      return { message: 'If that email is registered, you will receive a password reset link' };
    }

    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.setPasswordResetToken(user.id, resetToken, resetExpiry);

    this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(err => {
      this.logger.error('Failed to send password reset email:', err);
    });

    return { message: 'If that email is registered, you will receive a password reset link' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.configService.get<number>('bcrypt.rounds', 12),
    );

    await this.userRepository.resetPassword(user.id, hashedPassword);

    return { message: 'Password reset successfully. You can now log in.' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateJwtPayload(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      }),
    ]);

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      this.configService.get<number>('bcrypt.rounds', 12),
    );

    await this.userRepository.updateRefreshToken(userId, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpiresInSeconds(this.configService.get<string>('jwt.expiresIn', '15m')),
    };
  }

  private getExpiresInSeconds(expiresIn: string): number {
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    return parseInt(match[1]) * (units[match[2]] || 1);
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, emailVerificationToken, passwordResetToken, ...sanitized } = user;
    return sanitized;
  }
}
