import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddTrackingEventDto {
  @ApiProperty({
    description:
      'e.g. "Confirmed by Vendor", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled". Also becomes the order\'s current trackingStatus.',
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Optional note, e.g. courier name + AWB number' })
  @IsOptional()
  @IsString()
  note?: string;
}
