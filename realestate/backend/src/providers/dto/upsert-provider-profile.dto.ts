import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpsertProviderProfileDto {
  @ApiProperty() @IsString() displayName: string;
  @ApiProperty({ enum: ServiceCategory }) @IsEnum(ServiceCategory) category: ServiceCategory;
  @ApiPropertyOptional() @IsOptional() @IsString() specialty?: string;
  @ApiProperty() @IsString() city: string;
  @ApiPropertyOptional({ example: '₹499' }) @IsOptional() @IsString() priceFrom?: string;
}
