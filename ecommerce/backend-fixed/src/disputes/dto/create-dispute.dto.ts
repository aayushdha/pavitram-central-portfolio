import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ enum: ['customer', 'business_buyer', 'vendor'] })
  @IsIn(['customer', 'business_buyer', 'vendor'])
  raisedBy: string;

  @ApiPropertyOptional({ description: "The id of the user who raised this, so it shows up on their own 'My Disputes' view." })
  @IsOptional()
  @IsString()
  raisedByUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  against?: string;

  @ApiProperty({ enum: ['defective', 'quality_rejection', 'partial_shortage', 'non_delivery', 'other'] })
  @IsIn(['defective', 'quality_rejection', 'partial_shortage', 'non_delivery', 'other'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  evidenceUrls?: string[];
}
