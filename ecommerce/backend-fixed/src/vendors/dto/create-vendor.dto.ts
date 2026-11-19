import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export const VENDOR_CHANNELS = ['Both', 'B2B Only', 'B2C Only'] as const;

export class CreateVendorDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: VENDOR_CHANNELS })
  @IsOptional()
  @IsIn(VENDOR_CHANNELS as unknown as string[])
  channel?: string;

  @ApiPropertyOptional({ default: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gmvB2C?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gmvB2B?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: 'e.g. "2.1%"' })
  @IsOptional()
  @IsString()
  returns?: string;

  @ApiPropertyOptional({ description: 'e.g. "Feb 2025"' })
  @IsOptional()
  @IsString()
  joined?: string;

  // BUGFIX: registration form collects these but nothing accepted them.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pan?: string;

  @ApiPropertyOptional({ description: 'Bank account number for payouts' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Labeled KYC document URLs, e.g. {"GST Certificate": "https://...", "Signature": "https://..."}',
  })
  @IsOptional()
  @IsObject()
  kycDocuments?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Shown back to the vendor when status is Rejected/Suspended after KYC review' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Origin state (e.g. "Gujarat") — used by the GST auto-calculation engine to determine intra vs inter-state tax' })
  @IsOptional()
  @IsString()
  state?: string;
}
