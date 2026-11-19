import { ApiPropertyOptional } from '@nestjs/swagger';
import { SiteVisitStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateSiteVisitDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?: string;
  @ApiPropertyOptional({ enum: SiteVisitStatus }) @IsOptional() @IsEnum(SiteVisitStatus) status?: SiteVisitStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
