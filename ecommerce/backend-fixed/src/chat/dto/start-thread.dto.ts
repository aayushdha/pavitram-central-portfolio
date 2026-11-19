import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StartThreadDto {
  @ApiPropertyOptional({ description: "Customer's User.id if signed in" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Display name shown in the admin inbox' })
  @IsString()
  userName: string;

  @ApiPropertyOptional({ enum: ['customer', 'vendor', 'b2b'], default: 'customer' })
  @IsOptional()
  @IsString()
  userRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'First message body — if given, creates the thread with this message already in it' })
  @IsOptional()
  @IsString()
  message?: string;
}
