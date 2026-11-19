import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRfqDto {
  @ApiProperty()
  @IsString()
  buyer: string;

  @ApiPropertyOptional({ description: "Business buyer's stable id — lets the buyer's RFQ list match by id instead of the mutable company name." })
  @IsOptional()
  @IsString()
  buyerId?: string;

  @ApiPropertyOptional({ description: 'Vendor id this RFQ is routed to (the chosen product\'s vendor). Only that vendor should see it in their RFQ inbox.' })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiProperty()
  @IsString()
  product: string;

  @ApiProperty()
  @IsString()
  qty: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  raised?: string;

  @ApiPropertyOptional({ description: "Vendor's quoted price per unit." })
  @IsOptional()
  @IsNumber()
  quotedPrice?: number;

  @ApiPropertyOptional({ description: "Vendor's quoted lead time, e.g. \"5 days\"." })
  @IsOptional()
  @IsString()
  leadTime?: string;

  @ApiPropertyOptional({ description: 'Date the quotation is valid until.' })
  @IsOptional()
  @IsString()
  validUntil?: string;

  @ApiPropertyOptional({ description: "Buyer's notes for the vendor (packaging, quality, delivery requirements)." })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Target delivery date requested by the buyer.' })
  @IsOptional()
  @IsString()
  targetDate?: string;
}
