import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationService } from './recommendation.service';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  // ─── GET /recommendations/:id ─────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a recommendation by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Recommendation ID' })
  @ApiResponse({ status: 200, description: 'Recommendation found.' })
  @ApiResponse({ status: 404, description: 'Recommendation not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getRecommendation(@Param('id') id: string) {
    return this.recommendationService.getRecommendation(id);
  }

  // ─── GET /recommendations/business/:businessId ────────────────────────────

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all recommendations for a business' })
  @ApiParam({ name: 'businessId', type: String, description: 'Business ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of recommendations for the business.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBusinessRecommendations(@Param('businessId') businessId: string) {
    return this.recommendationService.getBusinessRecommendations(businessId);
  }

  // ─── PATCH /recommendations/:id/action ───────────────────────────────────

  @Patch(':id/action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a recommendation as actioned' })
  @ApiParam({ name: 'id', type: String, description: 'Recommendation ID' })
  @ApiResponse({
    status: 200,
    description: 'Recommendation marked as actioned.',
  })
  @ApiResponse({ status: 404, description: 'Recommendation not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async markActioned(@Param('id') id: string) {
    return this.recommendationService.markActioned(id);
  }
}
