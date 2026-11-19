import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateReceivableDto {
  @ApiProperty()
  @IsString()
  buyer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  invoiced?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  collected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  overdue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;
}
