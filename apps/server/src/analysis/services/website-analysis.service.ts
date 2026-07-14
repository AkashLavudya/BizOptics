import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface WebsiteAnalysisResult {
  hasWebsite: boolean;
  isHttps: boolean;
  hasContactPage: boolean;
  hasBookingPage: boolean;
  hasMobileOptimization: boolean;
  hasAnalytics: boolean;
  hasSocialProof: boolean;
  loadTimeMs?: number;
  score: number;
  details: Record<string, any>;
}

@Injectable()
export class WebsiteAnalysisService {
  private readonly logger = new Logger(WebsiteAnalysisService.name);
  private readonly TIMEOUT_MS = 10_000;

  constructor(private readonly httpService: HttpService) {}

  // ─── Main Entry Point ──────────────────────────────────────────────────────

  async analyze(business: any): Promise<WebsiteAnalysisResult> {
    const websiteUrl: string | undefined = business.website;

    if (!websiteUrl) {
      const result = this.getDefaultResult();
      result.score = 0;
      return result;
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      // Deterministically generate mock website analysis metrics based on business properties
      const name = business.name || '';
      const seed = name.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
      const isHttps = this.checkHttps(websiteUrl);
      const hasContactPage = seed % 3 !== 0; // ~66%
      const hasBookingPage = seed % 2 === 0; // 50%
      const hasMobileOptimization = seed % 5 !== 0; // 80%
      const hasAnalytics = seed % 4 !== 0; // 75%
      const hasSocialProof = seed % 3 !== 0; // 66%
      const loadTimeMs = 300 + (seed % 15) * 150; // 300ms - 2.5s

      const result: WebsiteAnalysisResult = {
        hasWebsite: true,
        isHttps,
        hasContactPage,
        hasBookingPage,
        hasMobileOptimization,
        hasAnalytics,
        hasSocialProof,
        loadTimeMs,
        score: 0,
        details: { url: websiteUrl, statusCode: 200, mock: true },
      };

      result.score = this.calculateScore(result);
      return result;
    }

    const exists = await this.checkWebsiteExists(websiteUrl);

    if (!exists.reachable) {
      return {
        hasWebsite: true,
        isHttps: this.checkHttps(websiteUrl),
        hasContactPage: false,
        hasBookingPage: false,
        hasMobileOptimization: false,
        hasAnalytics: false,
        hasSocialProof: false,
        score: 5,
        details: { error: exists.error ?? 'Unreachable', url: websiteUrl },
      };
    }

    const html = exists.html ?? '';

    const isHttps = this.checkHttps(websiteUrl);
    const hasContactPage = this.checkContactPage(html);
    const hasBookingPage = this.checkBookingPage(html);
    const hasMobileOptimization = this.checkMobileOptimization(html);
    const hasAnalytics = this.checkAnalytics(html);
    const hasSocialProof = this.checkSocialProof(html);

    const result: WebsiteAnalysisResult = {
      hasWebsite: true,
      isHttps,
      hasContactPage,
      hasBookingPage,
      hasMobileOptimization,
      hasAnalytics,
      hasSocialProof,
      loadTimeMs: exists.loadTimeMs,
      score: 0,
      details: { url: websiteUrl, statusCode: exists.statusCode },
    };

    result.score = this.calculateScore(result);
    return result;
  }

  // ─── Default / Fallback Result ─────────────────────────────────────────────

  getDefaultResult(): WebsiteAnalysisResult {
    return {
      hasWebsite: false,
      isHttps: false,
      hasContactPage: false,
      hasBookingPage: false,
      hasMobileOptimization: false,
      hasAnalytics: false,
      hasSocialProof: false,
      score: 0,
      details: {},
    };
  }

  // ─── Check Website Exists ──────────────────────────────────────────────────

  async checkWebsiteExists(url: string): Promise<{
    reachable: boolean;
    html?: string;
    statusCode?: number;
    loadTimeMs?: number;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: this.TIMEOUT_MS,
          maxRedirects: 5,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; BizOpticsBot/1.0; +https://bizoptics.com)',
          },
          validateStatus: (status) => status < 500,
        }),
      );

      return {
        reachable: response.status < 400,
        html: typeof response.data === 'string' ? response.data : '',
        statusCode: response.status,
        loadTimeMs: Date.now() - start,
      };
    } catch (err) {
      const axiosErr = err as AxiosError;
      let errorMsg = axiosErr.message;
      if (axiosErr.code === 'ECONNABORTED') errorMsg = 'Request timed out';
      if (axiosErr.code === 'CERT_HAS_EXPIRED') errorMsg = 'SSL certificate expired';
      if (axiosErr.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') errorMsg = 'SSL verification failed';

      this.logger.warn(`checkWebsiteExists failed for ${url}: ${errorMsg}`);
      return { reachable: false, error: errorMsg };
    }
  }

  // ─── HTTPS ─────────────────────────────────────────────────────────────────

  checkHttps(url: string): boolean {
    return url.toLowerCase().startsWith('https://');
  }

  // ─── Contact Page ─────────────────────────────────────────────────────────

  checkContactPage(html: string): boolean {
    const lower = html.toLowerCase();
    const keywords = [
      'contact us',
      'contact-us',
      'contactus',
      'get in touch',
      'reach us',
      'send us a message',
      'contact form',
      '/contact',
    ];
    return keywords.some((kw) => lower.includes(kw));
  }

  // ─── Booking Page ─────────────────────────────────────────────────────────

  checkBookingPage(html: string): boolean {
    const lower = html.toLowerCase();
    const keywords = [
      'book an appointment',
      'book appointment',
      'book now',
      'schedule an appointment',
      'schedule appointment',
      'make a reservation',
      'request appointment',
      'online booking',
      'book online',
      'calendly',
      'acuityscheduling',
      'setmore',
      'booksy',
      'mindbodyonline',
      '/book',
      '/schedule',
      '/appointment',
    ];
    return keywords.some((kw) => lower.includes(kw));
  }

  // ─── Mobile Optimization ──────────────────────────────────────────────────

  checkMobileOptimization(html: string): boolean {
    const lower = html.toLowerCase();
    return (
      lower.includes('viewport') &&
      (lower.includes('width=device-width') ||
        lower.includes('width = device-width'))
    );
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  checkAnalytics(html: string): boolean {
    const lower = html.toLowerCase();
    const indicators = [
      'google-analytics.com',
      'googletagmanager.com',
      'gtag(',
      'ga(',
      'analytics.js',
      'gtm.js',
      'segment.com',
      'hotjar.com',
      'mixpanel',
      'heap.io',
      'clarity.ms',
      'facebook pixel',
      'fbq(',
    ];
    return indicators.some((ind) => lower.includes(ind));
  }

  // ─── Social Proof ─────────────────────────────────────────────────────────

  checkSocialProof(html: string): boolean {
    const lower = html.toLowerCase();
    const keywords = [
      'testimonial',
      'review',
      'customer review',
      'what our customers say',
      'what clients say',
      'star rating',
      'rated',
      'trustpilot',
      'google reviews',
      'yelp',
      'five stars',
      '5 stars',
      'satisfied customers',
    ];
    return keywords.some((kw) => lower.includes(kw));
  }

  // ─── Score Calculation ────────────────────────────────────────────────────

  calculateScore(result: WebsiteAnalysisResult): number {
    // Weights sum = 100
    const weights: Array<[boolean, number]> = [
      [result.hasWebsite, 20],
      [result.isHttps, 15],
      [result.hasMobileOptimization, 15],
      [result.hasAnalytics, 15],
      [result.hasContactPage, 10],
      [result.hasBookingPage, 15],
      [result.hasSocialProof, 10],
    ];

    const earned = weights.reduce(
      (sum, [flag, weight]) => sum + (flag ? weight : 0),
      0,
    );

    // Bonus for fast load time
    let bonus = 0;
    if (result.loadTimeMs !== undefined && result.loadTimeMs < 2000) {
      bonus = 5;
    }

    return Math.min(100, earned + bonus);
  }
}
