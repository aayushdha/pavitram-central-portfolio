import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommissionRuleDto {
  @ApiProperty({ enum: ['global', 'category', 'vendor', 'product'] })
  @IsIn(['global', 'category', 'vendor', 'product'])
  scope: string;

  @ApiPropertyOptional({ description: 'category name / vendorId / productId — omit for global scope' })
  @IsOptional()
  @IsString()
  scopeRef?: string;

  @ApiPropertyOptional({ enum: ['B2C', 'B2B', 'Both'] })
  @IsOptional()
  @IsIn(['B2C', 'B2B', 'Both'])
  channel?: string;

  @ApiPropertyOptional({ enum: ['percent', 'flat'] })
  @IsOptional()
  @IsIn(['percent', 'flat'])
  type?: string;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: 'B2B volume slab lower bound on order value' })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiPropertyOptional({ description: 'B2B volume slab upper bound on order value' })
  @IsOptional()
  @IsNumber()
  maxOrderValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
