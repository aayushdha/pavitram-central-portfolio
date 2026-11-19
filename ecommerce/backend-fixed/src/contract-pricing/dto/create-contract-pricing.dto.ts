import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateContractPricingDto {
  @ApiProperty()
  @IsString()
  buyer: string;

  @ApiProperty()
  @IsString()
  product: string;

  @ApiProperty()
  @IsString()
  rate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  validity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;
}
