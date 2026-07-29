import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}

class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/)
  @Matches(/[a-z]/)
  @Matches(/[0-9]/)
  @Matches(/[^A-Za-z0-9]/)
  newPassword: string;
}

class SaveApiKeyDto {
  @ApiProperty({ description: 'Google Places API key (leave empty string to remove)' })
  @IsString()
  googlePlacesApiKey: string;
}

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  @Patch('api-key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save user Google Places API key' })
  async saveApiKey(@CurrentUser() user: any, @Body() dto: SaveApiKeyDto) {
    return this.profileService.saveApiKey(user.id, dto.googlePlacesApiKey);
  }

  @Get('api-key/status')
  @ApiOperation({ summary: 'Check if user has a Google Places API key saved' })
  async getApiKeyStatus(@CurrentUser() user: any) {
    return this.profileService.getApiKeyStatus(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user activity stats' })
  async getActivityStats(@CurrentUser() user: any) {
    return this.profileService.getActivityStats(user.id);
  }
}
