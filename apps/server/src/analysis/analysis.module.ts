import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { WebsiteAnalysisService } from './services/website-analysis.service';
import { AutomationAnalysisService } from './services/automation-analysis.service';
import { AIAgentAnalysisService } from './services/ai-agent-analysis.service';
import { ScoringService } from './services/scoring.service';
import { AnalysisRepository } from './repositories/analysis.repository';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [HttpModule, RecommendationModule],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    WebsiteAnalysisService,
    AutomationAnalysisService,
    AIAgentAnalysisService,
    ScoringService,
    AnalysisRepository,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
