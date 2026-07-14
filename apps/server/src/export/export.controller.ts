import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsEnum, IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExportDto {
  @ApiProperty({ enum: ['CSV', 'EXCEL', 'PDF'] })
  @IsEnum(['CSV', 'EXCEL', 'PDF'])
  format: 'CSV' | 'EXCEL' | 'PDF';

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessIds?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeAnalysis?: boolean = true;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean = true;
}

@ApiTags('Export')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export businesses data in CSV, Excel, or PDF format' })
  async exportData(@Body() exportDto: ExportDto, @Res() res: Response) {
    const { format, businessIds } = exportDto;

    if (format === 'CSV') {
      const buffer = await this.exportService.exportCSV(businessIds);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="bizoptics-export-${Date.now()}.csv"`);
      return res.send(buffer);
    }

    if (format === 'EXCEL') {
      const buffer = await this.exportService.exportExcel(businessIds);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="bizoptics-export-${Date.now()}.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'PDF') {
      const buffer = await this.exportService.exportPDF(businessIds);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bizoptics-report-${Date.now()}.pdf"`);
      return res.send(buffer);
    }
  }

  @Get('csv')
  @ApiOperation({ summary: 'Quick export all businesses as CSV' })
  async exportAllCSV(@Res() res: Response) {
    const buffer = await this.exportService.exportCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bizoptics-businesses-${Date.now()}.csv"`);
    return res.send(buffer);
  }

  @Get('excel')
  @ApiOperation({ summary: 'Quick export all businesses as Excel' })
  async exportAllExcel(@Res() res: Response) {
    const buffer = await this.exportService.exportExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bizoptics-businesses-${Date.now()}.xlsx"`);
    return res.send(buffer);
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Quick export all businesses as PDF report' })
  async exportAllPDF(@Res() res: Response) {
    const buffer = await this.exportService.exportPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bizoptics-report-${Date.now()}.pdf"`);
    return res.send(buffer);
  }
}
