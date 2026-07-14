import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { GooglePlacesService } from './google-places.service';
import { BusinessModule } from '../business/business.module';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [HttpModule, BusinessModule, AnalysisModule],
  controllers: [SearchController],
  providers: [SearchService, GooglePlacesService],
  exports: [SearchService],
})
export class SearchModule {}
