import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { TierPricingDto } from './tier-pricing.dto';
import { VariantDto } from './variant.dto';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Vendor display name (denormalized, matches frontend seed data)' })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({ description: 'FK to Vendor.id' })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Emoji or cover image URL (kept for backward compatibility)' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ type: [String], description: 'Full photo gallery URLs, shown on the product detail page' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Product video URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  reviews?: number;

  @ApiPropertyOptional({ description: 'Maximum retail price' })
  @IsOptional()
  @IsNumber()
  mrp?: number;

  @ApiProperty({ description: 'Base selling price' })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ type: [String], description: 'e.g. ["b2c","b2b"]' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  channels?: string[];

  @ApiPropertyOptional({ description: 'Minimum order quantity' })
  // BUGFIX: this was `@Min(1)` unconditionally, but the frontend correctly
  // sends `moq: 0` for a B2C-only product (MOQ is meaningless outside B2B).
  // That meant EVERY B2C-only product add/edit was rejected by validation
  // with "moq must not be less than 1" — a core vendor workflow was
  // completely broken. 0 is a legitimate, meaningful value here.
  @IsOptional()
  @IsInt()
  @Min(0)
  moq?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['Pending', 'Approved', 'Rejected'],
    description: 'Moderation status. New/edited listings default to "Pending" and only "Approved" ones are shown on the storefront.',
  })
  @IsOptional()
  @IsIn(['Pending', 'Approved', 'Rejected'])
  status?: string;

  @ApiPropertyOptional({ description: 'Shown back to the vendor when status = "Rejected"' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'HSN/SAC code for GST classification, used by the GST auto-calculation engine' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ description: 'GST % applicable to this product (e.g. 5, 12, 18, 28). Defaults to 18.' })
  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @ApiPropertyOptional({
    type: [TierPricingDto],
    description: 'Bulk/quantity-slab pricing. Passing this on create/update fully replaces the tier list.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TierPricingDto)
  tierPricing?: TierPricingDto[];

  // BUGFIX: added so the variant builder's data actually persists — see
  // schema.prisma comment on Product.variants for the full story.
  @ApiPropertyOptional({
    type: [VariantDto],
    description: 'Size/color/etc. variants, each with its own price/stock/SKU. Passing this on create/update fully replaces the variant list.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}
