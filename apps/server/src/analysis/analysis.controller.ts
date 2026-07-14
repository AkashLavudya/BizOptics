import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalysisService } from './analysis.service';

class BatchAnalysisDto {
  businessIds: string[];
}

@ApiTags('Analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  // ─── POST /analysis/business/:businessId ──────────────────────────────────

  @Post('business/:businessId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Trigger a full analysis for a single business' })
  @ApiParam({ name: 'businessId', type: String, description: 'Business ID' })
  @ApiResponse({
    status: 201,
    description: 'Analysis created and persisted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async triggerAnalysis(@Param('businessId') businessId: string) {
    return this.analysisService.analyzeBusiness(businessId);
  }

  // ─── GET /analysis/:id ────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get an analysis by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Analysis ID' })
  @ApiResponse({ status: 200, description: 'Analysis found.' })
  @ApiResponse({ status: 404, description: 'Analysis not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAnalysis(@Param('id') id: string) {
    return this.analysisService.getAnalysis(id);
  }

  // ─── GET /analysis/business/:businessId ───────────────────────────────────

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all analyses for a business' })
  @ApiParam({ name: 'businessId', type: String, description: 'Business ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of analyses for the given business.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBusinessAnalyses(@Param('businessId') businessId: string) {
    return this.analysisService.getBusinessAnalyses(businessId);
  }

  // ─── POST /analysis/batch ─────────────────────────────────────────────────

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch analyze multiple businesses' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        businessIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['biz-id-1', 'biz-id-2'],
        },
      },
      required: ['businessIds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Batch analysis results returned.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async batchAnalyze(@Body() body: BatchAnalysisDto) {
    return this.analysisService.analyzeBusinesses(body.businessIds);
  }
}
