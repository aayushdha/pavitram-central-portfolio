import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateReturnRequestDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ type: [String], description: 'photo URLs uploaded via /api/uploads' })
  @IsOptional()
  @IsArray()
  photos?: string[];
}
