import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';
import { ScanDto } from './dto/search.dto';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // ─── POST /search/scan ────────────────────────────────────────────────────

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scan a state for businesses across all categories',
    description:
      'Automatically searches all 15 business categories in the given US state, ' +
      'deduplicates results, persists discovered businesses, and returns everything found.',
  })
  @ApiResponse({ status: 200, description: 'Scan completed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async scan(@Request() req: any, @Body() dto: ScanDto) {
    return this.searchService.scan(req.user.id, dto);
  }

  // ─── POST /search (legacy) ────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Legacy search — use /search/scan instead' })
  @ApiResponse({ status: 200, description: 'Search executed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async search(@Request() req: any, @Body() body: any) {
    return this.searchService.search(req.user.id, body);
  }

  // ─── GET /search/history ──────────────────────────────────────────────────

  @Get('history')
  @ApiOperation({ summary: 'Get scan/search history for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns paginated scan history.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSearchHistory(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.searchService.getSearchHistory(req.user.id, page, limit);
  }

  // ─── DELETE /search/history/:id ───────────────────────────────────────────

  @Delete('history/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific scan history entry' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Entry deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async deleteSearchHistory(@Request() req: any, @Param('id') historyId: string) {
    return this.searchService.deleteSearchHistory(req.user.id, historyId);
  }
}
