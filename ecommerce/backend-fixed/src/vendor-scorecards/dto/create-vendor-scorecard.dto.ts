import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateVendorScorecardDto {
  @ApiProperty()
  @IsString()
  vendor: string;

  @ApiProperty()
  @IsNumber()
  sla: number;

  @ApiProperty()
  @IsNumber()
  quality: number;

  @ApiProperty()
  @IsString()
  rfqResponse: string;

  @ApiProperty()
  @IsString()
  composite: string;
}
