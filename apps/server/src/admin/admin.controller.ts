import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsString, IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

class AdminUsersQueryDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() status?: string;
}

class UpdateRoleDto {
  @ApiProperty({ enum: ['ADMIN', 'ANALYST', 'USER'] })
  @IsEnum(['ADMIN', 'ANALYST', 'USER'])
  role: string;
}

class UpdateStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  status: string;
}

class AuditLogQueryDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() action?: string;
  @IsOptional() @IsString() entity?: string;
}

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system-wide statistics (Admin only)' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      search: query.search,
      role: query.role,
      status: query.status,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateUserRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Patch('users/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateUserStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminService.updateUserStatus(id, dto.status);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.adminService.getAuditLogs({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      userId: query.userId,
      action: query.action,
      entity: query.entity,
    });
  }
}
