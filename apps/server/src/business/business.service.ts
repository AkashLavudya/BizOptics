import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { BusinessRepository } from './repositories/business.repository';
import { BusinessFilterDto } from './dto/business-filter.dto';
import { AnalysisService } from '../analysis/analysis.service';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly analysisService: AnalysisService,
  ) {}

  // ─── findAll ──────────────────────────────────────────────────────────────
  async findAll(
    filters: BusinessFilterDto,
    _user?: any,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      city,
      state,
      minScore,
      maxScore,
      priorityLevel,
      opportunityType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    this.logger.log(
      `findAll called – page=${page} limit=${limit} search=${search ?? 'none'}`,
    );

    const { businesses, total } = await this.businessRepository.findAll({
      page,
      limit,
      search,
      category,
      city,
      state,
      minScore,
      maxScore,
      priorityLevel,
      opportunityType,
      sortBy,
      sortOrder,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: businesses,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ─── findById ─────────────────────────────────────────────────────────────
  async findById(id: string, _user?: any): Promise<any> {
    this.logger.log(`findById called – id=${id}`);

    const business = await this.businessRepository.findById(id);

    if (!business) {
      throw new NotFoundException(`Business with id "${id}" not found`);
    }

    return business;
  }

  // ─── delete ───────────────────────────────────────────────────────────────
  async delete(id: string, user?: any): Promise<void> {
    this.logger.log(`delete called – id=${id} by user=${user?.id ?? 'unknown'}`);

    if (user && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete businesses');
    }

    const existing = await this.businessRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Business with id "${id}" not found`);
    }

    await this.businessRepository.delete(id);
  }

  // ─── getAnalysis ──────────────────────────────────────────────────────────
  async getAnalysis(businessId: string, _user?: any): Promise<any[]> {
    this.logger.log(`getAnalysis called – businessId=${businessId}`);

    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException(`Business with id "${businessId}" not found`);
    }

    return business.analyses ?? [];
  }

  // ─── getRecommendations ───────────────────────────────────────────────────
  async getRecommendations(businessId: string, _user?: any): Promise<any[]> {
    this.logger.log(`getRecommendations called – businessId=${businessId}`);

    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException(`Business with id "${businessId}" not found`);
    }

    return business.recommendations ?? [];
  }

  // ─── triggerAnalysis ──────────────────────────────────────────────────────
  // Delegates to AnalysisService which runs all three sub-analyses, persists
  // the Analysis record (status=COMPLETED), and generates Recommendation records.
  async triggerAnalysis(businessId: string, _user?: any): Promise<any> {
    this.logger.log(`triggerAnalysis called – businessId=${businessId}`);

    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException(`Business with id "${businessId}" not found`);
    }

    // Run full analysis pipeline and return the persisted analysis record
    const analysisRecord = await this.analysisService.analyzeBusiness(businessId);

    // Return the updated business with the fresh analysis attached
    const updated = await this.businessRepository.findById(businessId);
    return {
      business: updated,
      analysis: analysisRecord,
      message: 'Analysis complete — scores and recommendations updated.',
    };
  }
}
