import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateReturnRequestDto } from './create-return-request.dto';

export class UpdateReturnRequestDto extends PartialType(CreateReturnRequestDto) {
  @ApiPropertyOptional({ enum: ['Requested', 'Approved', 'Rejected', 'PickupScheduled', 'Refunded'] })
  @IsOptional()
  @IsIn(['Requested', 'Approved', 'Rejected', 'PickupScheduled', 'Refunded'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  refundAmount?: number;

  @ApiPropertyOptional({ enum: ['wallet', 'source_account'] })
  @IsOptional()
  @IsIn(['wallet', 'source_account'])
  refundMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNote?: string;
}
