import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProjectUnitInput {
  @ApiProperty({ example: '2 BHK' }) @IsString() configuration: string;
  @ApiProperty() @IsInt() @Min(1) areaSqft: number;
  @ApiProperty() @IsInt() @Min(0) price: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) unitsAvailable?: number;
}

export class CreateProjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() locality: string;
  @ApiProperty({ enum: ProjectType }) @IsEnum(ProjectType) type: ProjectType;

  @ApiProperty() @IsInt() @Min(0) priceFrom: number;
  @ApiProperty() @IsInt() @Min(0) priceTo: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  configurations?: string[];

  @ApiProperty() @IsInt() @Min(1) areaFrom: number;
  @ApiProperty() @IsInt() @Min(1) areaTo: number;

  @ApiProperty({ example: 'Dec 2027' }) @IsString() possessionLabel: string;
  @ApiProperty({ enum: ProjectStatus }) @IsEnum(ProjectStatus) status: ProjectStatus;

  @ApiPropertyOptional() @IsOptional() @IsString() rera?: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() reraVerified?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) totalUnits?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) towers?: number;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) connectivity?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;

  @ApiPropertyOptional({ type: [ProjectUnitInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectUnitInput)
  units?: ProjectUnitInput[];
}
