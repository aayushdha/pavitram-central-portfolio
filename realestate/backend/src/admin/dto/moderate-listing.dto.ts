import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModerationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ModerateListingDto {
  @ApiProperty({ enum: ModerationStatus }) @IsEnum(ModerationStatus) status: ModerationStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
