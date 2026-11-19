import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryProviderDto {
  @ApiPropertyOptional({ enum: ServiceCategory }) @IsOptional() @IsEnum(ServiceCategory) category?: ServiceCategory;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
}
