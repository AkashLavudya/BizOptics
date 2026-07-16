import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root Status Check' })
  @ApiResponse({ status: 200, description: 'API is running and accessible.' })
  getStatus() {
    return {
      status: 'healthy',
      service: 'BizOptics API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check (for uptime monitors)' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
