import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ enum: ['customer', 'admin'] })
  @IsIn(['customer', 'admin'])
  sender: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiProperty()
  @IsString()
  body: string;
}
