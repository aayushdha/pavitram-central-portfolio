import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export const BUYER_SEGMENTS = ['Retailer', 'Distributor', 'Institutional', 'Export'] as const;

export class CreateBusinessBuyerDto {
  @ApiProperty()
  @IsString()
  company: string;

  @ApiPropertyOptional({ enum: BUYER_SEGMENTS })
  @IsOptional()
  @IsIn(BUYER_SEGMENTS as unknown as string[])
  segment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  // BUGFIX: added so PAN/CIN/trade license/bank account collected on the
  // registration form actually get persisted — see schema.prisma comment.
  @ApiPropertyOptional({ description: 'Business PAN' })
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiPropertyOptional({ description: 'CIN or Udyam registration number' })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tradeLicense?: string;

  @ApiPropertyOptional({ description: 'Bank account number for settlements' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({ default: 'Under Review' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  utilized?: number;

  @ApiPropertyOptional({ description: 'e.g. "Net 30"' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Labeled KYC document URLs, e.g. {"GST Certificate": "https://...", "Signature": "https://..."}',
  })
  @IsOptional()
  @IsObject()
  kycDocuments?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Shown back to the business account when status is Rejected after KYC review' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
