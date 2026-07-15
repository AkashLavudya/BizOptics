import { IsString, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanDto {
  @ApiPropertyOptional({ example: 'United States', description: 'Country name' })
  @IsOptional()
  @IsString()
  country?: string = 'United States';

  @ApiProperty({ example: 'California', description: 'State name' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'Los Angeles', description: 'City name' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ default: 60, description: 'Max results per category scan' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(60)
  limit?: number = 60;
}

// Keep backward-compat alias
export { ScanDto as SearchDto };
