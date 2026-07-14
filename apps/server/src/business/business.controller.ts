import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { BusinessFilterDto } from './dto/business-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Businesses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /businesses
  // ─────────────────────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'List businesses',
    description:
      'Returns a paginated list of businesses with optional filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of businesses returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Query() filters: BusinessFilterDto, @CurrentUser() user: any) {
    return this.businessService.findAll(filters, user);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /businesses/:id
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single business',
    description: 'Returns a single business with its analysis and recommendations.',
  })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({ status: 200, description: 'Business returned successfully.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessService.findById(id, user);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /businesses/:id
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a business (Admin only)',
    description: 'Permanently removes a business record. Restricted to admins.',
  })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({ status: 204, description: 'Business deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin role required.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessService.delete(id, user);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /businesses/:id/analysis
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id/analysis')
  @ApiOperation({
    summary: 'Get analysis for a business',
    description: 'Returns the latest analysis record(s) for the specified business.',
  })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({ status: 200, description: 'Analysis returned successfully.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async getAnalysis(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessService.getAnalysis(id, user);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /businesses/:id/recommendations
  // ─────────────────────────────────────────────────────────────────────────────
  @Get(':id/recommendations')
  @ApiOperation({
    summary: 'Get recommendations for a business',
    description: 'Returns AI-generated opportunity recommendations for the business.',
  })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({ status: 200, description: 'Recommendations returned successfully.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async getRecommendations(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessService.getRecommendations(id, user);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /businesses/:id/analyze
  // ─────────────────────────────────────────────────────────────────────────────
  @Post(':id/analyze')
  @ApiOperation({
    summary: 'Trigger analysis for a business',
    description:
      'Kicks off a new analysis pass for the given business and returns the result.',
  })
  @ApiParam({ name: 'id', description: 'Business UUID' })
  @ApiResponse({ status: 201, description: 'Analysis triggered successfully.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async triggerAnalysis(@Param('id') id: string, @CurrentUser() user: any) {
    return this.businessService.triggerAnalysis(id, user);
  }
}
