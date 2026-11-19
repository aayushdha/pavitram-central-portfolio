import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPlanCode } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ enum: SubscriptionPlanCode })
  @IsEnum(SubscriptionPlanCode)
  planCode: SubscriptionPlanCode;
}
