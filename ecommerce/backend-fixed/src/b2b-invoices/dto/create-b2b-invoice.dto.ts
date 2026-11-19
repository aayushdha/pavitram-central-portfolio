import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateB2bInvoiceDto {
  @ApiProperty()
  @IsString()
  period: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  orders?: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
