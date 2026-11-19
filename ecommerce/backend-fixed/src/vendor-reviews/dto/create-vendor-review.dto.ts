import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const VENDOR_REVIEW_TYPES = ['B2B structured', 'B2C'] as const;

export class CreateVendorReviewDto {
  @ApiProperty({ description: 'Reviewer name / company' })
  @IsString()
  from: string;

  @ApiPropertyOptional({ enum: VENDOR_REVIEW_TYPES })
  @IsOptional()
  @IsIn(VENDOR_REVIEW_TYPES as unknown as string[])
  type?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  onTime?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  quality?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  responsiveness?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'FK to Vendor.id' })
  @IsOptional()
  @IsString()
  vendorId?: string;
}
