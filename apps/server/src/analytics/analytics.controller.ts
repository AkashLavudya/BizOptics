import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class AnalyticsQueryDto {
  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(7)
  @Max(365)
  days?: number = 30;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get full analytics data' })
  async getFullAnalytics() {
    return this.analyticsService.getFullAnalytics();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get businesses by category' })
  async getBusinessesByCategory() {
    return this.analyticsService.getBusinessesByCategory();
  }

  @Get('opportunities')
  @ApiOperation({ summary: 'Get opportunities by type' })
  async getOpportunitiesByType() {
    return this.analyticsService.getOpportunitiesByType();
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get score distribution' })
  async getScoreDistribution() {
    return this.analyticsService.getScoreDistribution();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get business trends over time' })
  async getTrendsOverTime(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTrendsOverTime(query.days);
  }

  @Get('top-opportunities')
  @ApiOperation({ summary: 'Get top scoring opportunities' })
  async getTopOpportunities(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTopOpportunities(query.limit);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset all businesses and search history' })
  async resetAllData() {
    return this.analyticsService.resetAllData();
  }
}
