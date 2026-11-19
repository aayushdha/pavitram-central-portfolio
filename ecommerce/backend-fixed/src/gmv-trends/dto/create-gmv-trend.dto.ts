import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateGmvTrendDto {
  @ApiProperty()
  @IsString()
  month: string;

  @ApiProperty()
  @IsNumber()
  b2c: number;

  @ApiProperty()
  @IsNumber()
  b2b: number;
}
