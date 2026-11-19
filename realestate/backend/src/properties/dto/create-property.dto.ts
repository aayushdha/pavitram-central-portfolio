import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Furnishing,
  ListingIntent,
  Possession,
  PriceUnit,
  PropertyType,
} from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(150) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(4000) description?: string;

  @ApiProperty({ enum: PropertyType }) @IsEnum(PropertyType) type: PropertyType;
  @ApiProperty({ enum: ListingIntent }) @IsEnum(ListingIntent) intent: ListingIntent;

  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() locality: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lng?: number;

  @ApiProperty() @IsInt() @Min(0) price: number;
  @ApiPropertyOptional({ enum: PriceUnit, default: PriceUnit.TOTAL })
  @IsOptional()
  @IsEnum(PriceUnit)
  priceUnit?: PriceUnit;

  @ApiPropertyOptional({ example: '2 BHK' }) @IsOptional() @IsString() bhk?: string;
  @ApiProperty() @IsInt() @Min(1) areaSqft: number;

  @ApiProperty({ enum: Possession }) @IsEnum(Possession) possession: Possession;
  @ApiProperty({ enum: Furnishing }) @IsEnum(Furnishing) furnishing: Furnishing;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  // Deliberately NO @ArrayNotEmpty() here — a listing with zero photos yet
  // (owner hasn't uploaded any) is a perfectly normal, valid state, not a
  // validation error. The frontend always sends `images` as an array (never
  // omits the key), so `[]` must be accepted, not rejected.
  @ApiPropertyOptional({ type: [String], description: 'Image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}