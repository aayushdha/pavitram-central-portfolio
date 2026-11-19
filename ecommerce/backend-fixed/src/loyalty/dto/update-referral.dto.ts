import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateReferralDto {
  @ApiPropertyOptional({ enum: ['Pending', 'Completed', 'Rewarded'] })
  @IsOptional()
  @IsIn(['Pending', 'Completed', 'Rewarded'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bonusPoints?: number;
}
