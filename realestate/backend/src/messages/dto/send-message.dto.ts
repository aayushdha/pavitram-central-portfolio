import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'The other participant of the conversation' })
  @IsString()
  toUserId: string;

  @ApiPropertyOptional({ description: 'Optional property this thread is about' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiProperty() @IsString() @MinLength(1) @MaxLength(4000) body: string;
}
