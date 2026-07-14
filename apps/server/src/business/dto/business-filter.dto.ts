import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessFilterDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: 'Number of items per page (max 500)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Full-text search across name, address, city, and category',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by business category (partial match)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by city (partial match)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by state (partial match)' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    description: 'Minimum opportunity score (inclusive)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 100,
    description: 'Maximum opportunity score (inclusive)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  maxScore?: number;

  @ApiPropertyOptional({
    description: 'Filter by priority level (e.g. HIGH, MEDIUM, LOW)',
  })
  @IsOptional()
  @IsString()
  priorityLevel?: string;

  @ApiPropertyOptional({
    description:
      'Filter by opportunity type (e.g. DIGITAL_PRESENCE, REPUTATION_MANAGEMENT, GROWTH_OPTIMIZATION)',
  })
  @IsOptional()
  @IsString()
  opportunityType?: string;

  @ApiPropertyOptional({
    default: 'createdAt',
    description:
      'Field to sort by (createdAt, updatedAt, name, opportunityScore, rating, reviewCount, city, state, category, priorityLevel)',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
