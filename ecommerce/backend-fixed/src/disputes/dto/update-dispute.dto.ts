import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateDisputeDto } from './create-dispute.dto';

export class UpdateDisputeDto extends PartialType(CreateDisputeDto) {
  @ApiPropertyOptional({
    enum: ['Evidence Review', 'Vendor Response Pending', 'Admin Arbitration', 'Refund Approved', 'Closed', 'Rejected'],
  })
  @IsOptional()
  @IsIn(['Evidence Review', 'Vendor Response Pending', 'Admin Arbitration', 'Refund Approved', 'Closed', 'Rejected'])
  stage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolution?: string;
}
