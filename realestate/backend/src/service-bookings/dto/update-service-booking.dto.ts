import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceBookingStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateServiceBookingDto {
  @ApiPropertyOptional({ enum: ServiceBookingStatus })
  @IsOptional()
  @IsEnum(ServiceBookingStatus)
  status?: ServiceBookingStatus;
}
