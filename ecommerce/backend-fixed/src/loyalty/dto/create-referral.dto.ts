import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateReferralDto {
  @ApiProperty({ description: 'userId of the referrer (must already have a loyalty account)' })
  @IsString()
  referrerUserId: string;

  @ApiProperty()
  @IsEmail()
  referredEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referredUserId?: string;
}
