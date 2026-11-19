import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewKycDto {
  @ApiProperty({ enum: KycStatus }) @IsEnum(KycStatus) status: KycStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
