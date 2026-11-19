import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListingIntent, PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryPropertyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() locality?: string;
  @ApiPropertyOptional({ enum: PropertyType }) @IsOptional() @IsEnum(PropertyType) type?: PropertyType;
  @ApiPropertyOptional({ enum: ListingIntent }) @IsOptional() @IsEnum(ListingIntent) intent?: ListingIntent;
  @ApiPropertyOptional() @IsOptional() @IsString() bhk?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) priceMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) priceMax?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() q?: string; // free text search on title

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number = 20;
}
