import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCohortDto {
  @ApiProperty()
  @IsString()
  segment: string;

  @ApiProperty()
  @IsString()
  retail: string;

  @ApiProperty()
  @IsString()
  business: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  risk?: string;
}
