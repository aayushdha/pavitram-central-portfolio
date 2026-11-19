import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ description: 'Customer name' })
  @IsString()
  from: string;

  @ApiPropertyOptional({ description: 'Reply-to email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: 'The actual message the customer typed' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
