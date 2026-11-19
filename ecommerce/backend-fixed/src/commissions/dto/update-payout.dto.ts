import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { CreatePayoutDto } from './create-payout.dto';

export class UpdatePayoutDto extends PartialType(CreatePayoutDto) {
  @ApiPropertyOptional({ enum: ['Pending', 'Approved', 'Paid', 'On Hold'] })
  @IsOptional()
  @IsIn(['Pending', 'Approved', 'Paid', 'On Hold'])
  status?: string;
}
