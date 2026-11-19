import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSavedSearchDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ type: Object, description: 'Arbitrary filter payload (city, type, intent, priceMin/Max, bhk, ...)' })
  @IsObject()
  filters: Record<string, unknown>;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() alertsEnabled?: boolean;
}
