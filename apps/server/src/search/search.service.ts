import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GooglePlacesService } from './google-places.service';
import { BusinessRepository } from '../business/repositories/business.repository';
import { ScanDto } from './dto/search.dto';
import { AnalysisService } from '../analysis/analysis.service';

// All business categories we auto-scan
const SCAN_CATEGORIES = [
  { query: 'restaurant', label: 'Restaurants' },
  { query: 'dental clinic', label: 'Dental Clinics' },
  { query: 'law office lawyer', label: 'Law Offices' },
  { query: 'beauty salon hair salon', label: 'Beauty Salons' },
  { query: 'gym fitness center', label: 'Fitness Centers' },
  { query: 'hotel motel', label: 'Hotels' },
  { query: 'real estate agency', label: 'Real Estate' },
  { query: 'auto repair mechanic', label: 'Auto Repair' },
  { query: 'retail store shopping', label: 'Retail Stores' },
  { query: 'accounting financial services', label: 'Accounting' },
  { query: 'healthcare clinic doctor', label: 'Healthcare' },
  { query: 'construction contractor', label: 'Construction' },
  { query: 'education school tutoring', label: 'Education' },
  { query: 'consulting agency', label: 'Consulting' },
  { query: 'pharmacy drugstore', label: 'Pharmacies' },
];

export interface ScanProgressEvent {
  category: string;
  found: number;
  saved: number;
}

export interface ScanResult {
  businesses: any[];
  total: number;
  categoriesScanned: number;
  state: string;
  savedToHistory: boolean;
  usingRealData: boolean;
}

export interface PaginatedSearchHistory {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly googlePlacesService: GooglePlacesService,
    private readonly businessRepository: BusinessRepository,
    private readonly prisma: PrismaService,
    private readonly analysisService: AnalysisService,
  ) {}

  // ─── Fetch user's Google Places API key from DB ──────────────────────────────

  private async getUserApiKey(userId: string): Promise<string | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { googlePlacesApiKey: true },
      });
      return user?.googlePlacesApiKey ?? null;
    } catch {
      return null;
    }
  }

  async debugApiKey(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { googlePlacesApiKey: true },
      });
      const dbKey = user?.googlePlacesApiKey ?? null;
      const envKey = process.env.GOOGLE_PLACES_API_KEY ?? null;
      const activeKey = dbKey || envKey;

      return {
        dbKeyStored: !!dbKey,
        dbKeyPreview: dbKey ? `${dbKey.slice(0, 8)}...${dbKey.slice(-4)}` : null,
        envKeySet: !!envKey,
        activeKeySource: dbKey ? 'database (user key)' : envKey ? 'environment variable' : 'none',
        mode: activeKey ? 'REAL Google Places data' : 'MOCK data',
        columnExists: true,
      };
    } catch (err) {
      return {
        error: (err as Error).message,
        columnExists: false,
        hint: 'The google_places_api_key column may not exist in the DB yet. Check if prisma db push ran successfully in the Render build logs.',
      };
    }
  }

  // ─── Scan all categories for a state ────────────────────────────────────────

  async scan(userId: string, dto: ScanDto): Promise<ScanResult> {
    const { country = 'United States', state, city, limit = 60 } = dto;

    // Fetch user's API key from DB — use it for real Google Places data
    const userApiKey = await this.getUserApiKey(userId);
    const usingRealData = !!userApiKey;

    this.logger.log(
      `User ${userId} scanning country="${country}" state="${state}" city="${city}" limit=${limit} | API: ${usingRealData ? 'REAL (user key)' : 'MOCK'}`,
    );

    const allSaved: any[] = [];
    const seenPlaceIds = new Set<string>();

    // Scan all categories in parallel batches of 3 to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < SCAN_CATEGORIES.length; i += batchSize) {
      const batch = SCAN_CATEGORIES.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(async ({ query, label }) => {
          try {
            const locationQuery = `${city}, ${state}, ${country}`;
            const searchQuery = `${query} in ${locationQuery}`;

            // Pass user's API key — GooglePlacesService will use it over env var
            const places = await this.googlePlacesService.searchPlaces(
              searchQuery,
              locationQuery,
              undefined,
              undefined,
              userApiKey ?? undefined,
            );

            const saved: any[] = [];
            for (const place of places.slice(0, Math.ceil(limit / SCAN_CATEGORIES.length) + 5)) {
              const placeId: string = (place as any).place_id ?? '';
              if (!placeId || seenPlaceIds.has(placeId)) continue;
              seenPlaceIds.add(placeId);

              try {
                const normalized = this.googlePlacesService.normalizePlace(place);
                const upserted = await this.businessRepository.upsertByGooglePlaceId(
                  placeId,
                  normalized,
                );
                // Automatically run analysis so that businesses have scores immediately
                try {
                  await this.analysisService.analyzeBusiness(upserted.id);
                } catch (analysisErr) {
                  this.logger.warn(`[${label}] Failed to auto-analyze ${placeId}: ${(analysisErr as Error).message}`);
                }
                saved.push(upserted);
              } catch (err) {
                this.logger.warn(`[${label}] Failed to upsert ${placeId}: ${(err as Error).message}`);
              }
            }

            this.logger.log(`[${label}] Found ${places.length} → saved ${saved.length} unique`);
            return saved;
          } catch (err) {
            this.logger.warn(`[${label}] scan failed: ${(err as Error).message}`);
            return [];
          }
        }),
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          allSaved.push(...result.value);
        }
      }
    }

    // Save a single history entry for the whole scan
    let savedToHistory = false;
    try {
      await this.prisma.searchHistory.create({
        data: {
          userId,
          query: `Scan: ${city}, ${state}, ${country}`,
          location: `${city}, ${state}, ${country}`,
          resultsCount: allSaved.length,
        },
      });
      savedToHistory = true;
    } catch (err) {
      this.logger.warn(`Could not save scan history: ${(err as Error).message}`);
    }

    this.logger.log(`Scan complete: ${allSaved.length} unique businesses saved for ${city}, ${state}`);

    return {
      businesses: allSaved,
      total: allSaved.length,
      categoriesScanned: SCAN_CATEGORIES.length,
      state,
      savedToHistory,
      usingRealData,
    };
  }

  // ─── Legacy search (kept for backward compat) ────────────────────────────────

  async search(userId: string, dto: any): Promise<any> {
    if (dto.state) {
      return this.scan(userId, dto as ScanDto);
    }

    const { query = 'businesses', location, radius = 25000, limit = 20 } = dto;
    this.logger.log(`Legacy search: "${query}" in ${location}`);

    const userApiKey = await this.getUserApiKey(userId);
    const places = await this.googlePlacesService.searchPlaces(
      query, location, radius, undefined, userApiKey ?? undefined,
    );
    const sliced = places.slice(0, limit);
    const savedBusinesses: any[] = [];

    for (const place of sliced) {
      const placeId: string = (place as any).place_id ?? '';
      if (!placeId) continue;
      try {
        const normalized = this.googlePlacesService.normalizePlace(place);
        const upserted = await this.businessRepository.upsertByGooglePlaceId(placeId, normalized);
        try {
          await this.analysisService.analyzeBusiness(upserted.id);
        } catch (analysisErr) {
          this.logger.warn(`Failed to auto-analyze ${placeId}: ${(analysisErr as Error).message}`);
        }
        savedBusinesses.push(upserted);
      } catch (err) {
        this.logger.warn(`Failed to upsert ${placeId}: ${(err as Error).message}`);
      }
    }

    try {
      await this.prisma.searchHistory.create({
        data: { userId, query, location: location ?? null, resultsCount: savedBusinesses.length },
      });
    } catch {}

    return { businesses: savedBusinesses, total: savedBusinesses.length, query };
  }

  // ─── Search History ────────────────────────────────────────────────────────

  async getSearchHistory(userId: string, page: number, limit: number): Promise<PaginatedSearchHistory> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.searchHistory.count({ where: { userId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Delete History Entry ──────────────────────────────────────────────────

  async deleteSearchHistory(userId: string, historyId: string): Promise<void> {
    const entry = await this.prisma.searchHistory.findFirst({
      where: { id: historyId, userId },
    });

    if (!entry) {
      throw new NotFoundException(`History entry ${historyId} not found.`);
    }

    await this.prisma.searchHistory.delete({ where: { id: historyId } });
  }
}
